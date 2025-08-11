import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { DiscoEnum, ElectricityMeter } from "../../entity/Meter";
import { IUser } from "../../interface/user.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import { Transaction, TransactionStatus, TransactionType } from "../../entity/Transactions";
import PaystackService, { getPaystackHeaders } from "../paystack.service";
import { Response } from "express";
import { makeNetworkCall } from "../networks.service";
import Logger from "../../utils/logger";
import ejs from "ejs";
import { appRoot } from "../../app";
import EmailService from "../email/email.service";
import { frontendBaseUrl } from "../../config/env";
import { manualDataPagination } from "../../utils/helpers";
import { PAGINATION } from "../../config/constants";

async function addNewMeter(user: IUser, data: { [key: string]: any }) {
  let meterPayload: { [key: string]: string } = {};

  for (const key in data) {
    if (data[key]) {
      meterPayload[key] = data[key];
    }
  }

  const verifyMeter = await ABSTRACT_SERVICE.getUniqueData(ElectricityMeter, { meterNumber: meterPayload.meterNumber });
  if (verifyMeter) {
    throw createError("Meter with this number already exists", ResponseCodeEnum.BAD_REQUEST);
  }

  const meterRecord = await ABSTRACT_SERVICE.createData(ElectricityMeter, {
    ...meterPayload,
    user: user
  })

  if (!meterRecord) {
    throw createError("Error creating meter", ResponseCodeEnum.INTERNAL_SERVER_ERROR);
  }

  return;
};

async function removeMeter(user: IUser, id: number) {
   const getMeter = await ABSTRACT_SERVICE.getUniqueData(ElectricityMeter, { id, userId: user.id });

   if (!getMeter) {
    throw createError("Meter not found", ResponseCodeEnum.NOT_FOUND);
   }

   await ABSTRACT_SERVICE.removeData(ElectricityMeter, { id, userId: user.id });
   return;
}

async function rechargeMeter(userProfile: IUser, data: { meterNumber: string, amount: number}) {
  const { meterNumber, amount } = data;

  const getMeter = await ABSTRACT_SERVICE.getUniqueData(ElectricityMeter, { meterNumber, userId: userProfile.id });

  if (!getMeter) {
    throw createError("Meter not found", ResponseCodeEnum.NOT_FOUND);
  }

  const createTransactionRecord = await ABSTRACT_SERVICE.createData(Transaction, {
    user: userProfile,
    amount: +amount,
    meterNumber,
    type: TransactionType.CREDIT,
    tx_ref: generateTransactionReference(),
    units: 0,
    description: "Recharge",
  });

  if (!createTransactionRecord) {
    throw createError("Error creating transaction", ResponseCodeEnum.INTERNAL_SERVER_ERROR);
  }

  const getTariff = getDiscoTariff(getMeter.disco || DiscoEnum.IKEDC);

  const generatePaymentLink = await PaystackService.generatePaymentLink({
    tx_ref: createTransactionRecord.tx_ref,
    amount: +amount,
    metadata: {
      amount: +amount,
      meterNumber,
      units: parseFloat((amount / getTariff).toFixed(2)),
      userId: +userProfile.id!,
      meterId: getMeter.id,
      email: userProfile.email,
      name: userProfile?.fullName?.split(" ")[0] || "",
      tariff: getTariff,
    },
    customer: {
      email: userProfile.email,
      name: userProfile.fullName,
    },
  });

  return generatePaymentLink;
}

async function verifyPskPayment(reference: string, res: Response) {
  const getTransaction = await ABSTRACT_SERVICE.getUniqueData(Transaction, { tx_ref: reference });

  if (!getTransaction) {
    Logger.error("Transaction not found", ResponseCodeEnum.NOT_FOUND);
    const errorPage = await redirectPage(TransactionStatus.FAILED, {
      paymentDetails: null,
      errorMessage: "Transaction not found",
    });
    return res.send(errorPage);
  }

  if (getTransaction.status === TransactionStatus.SUCCESS) {
    Logger.error("Transaction already verified", ResponseCodeEnum.BAD_REQUEST);
    const errorPage = await redirectPage(TransactionStatus.FAILED, {
      paymentDetails: null,
      errorMessage: "Transaction already verified",
    });
    return res.send(errorPage);
  }

  const headers = getPaystackHeaders();

  const confirmPayment = await makeNetworkCall({
    url: `https://api.paystack.co/transaction/verify/${reference}`,
    method: "GET",
    headers
  });

  const paymentRecord = confirmPayment?.data?.data;

  if (paymentRecord.status !== "success") {
    Logger.error("Payment not verified", ResponseCodeEnum.BAD_REQUEST);
    const errorPage = await redirectPage(TransactionStatus.FAILED, {
        paymentDetails: {
          reference,
          transactionId: reference,
          amount: getTransaction.amount,
          errorCode: 400,
        },
        errorMessage: "Payment not verified"
      })
    return res.send(errorPage);
  }

  if ((+paymentRecord.amount / 100) !== +getTransaction.amount) {
    Logger.error("Payment amount does not match", ResponseCodeEnum.BAD_REQUEST);
    const errorPage = await redirectPage(TransactionStatus.FAILED, {
        paymentDetails: {
          reference,
          transactionId: reference,
          amount: getTransaction.amount,
          errorCode: 404,
        },
        errorMessage: "Payment amount does not match"
      })
    return res.send(errorPage);
  }

  const paymentMetadata = paymentRecord?.metadata;
  const generateToken = generateVendToken();

  const updateTransaction = await ABSTRACT_SERVICE.updateByEntry(
    Transaction,
    { id: getTransaction.id },
    {
      status: TransactionStatus.SUCCESS,
      units: (+paymentMetadata.units).toFixed(2),
      tokenApplied: generateToken,
    },
  );

  if (!updateTransaction.affected) {
    Logger.error("Error updating transaction", ResponseCodeEnum.INTERNAL_SERVER_ERROR);
    const errorPage = await redirectPage(TransactionStatus.FAILED, {
        paymentDetails: {
          reference,
          transactionId: reference,
          amount: getTransaction.amount,
          errorCode: 500,
        },
        errorMessage: "Error updating transaction"
      })
    return res.send(errorPage);
  }

  const getMeterRecord = await ABSTRACT_SERVICE.getUniqueData(ElectricityMeter, {
    id: +paymentMetadata.meterId,
    userId: +paymentMetadata.userId
  });
  let newUnitBalance = 0

  if (getMeterRecord) {
    await ABSTRACT_SERVICE.updateByEntry(
      ElectricityMeter,
      { id: +paymentMetadata.meterId },
      { meterBalance: +getMeterRecord.meterBalance + +getTransaction.amount, lastRecharge: new Date() },
    );
    const newBalance = +getMeterRecord.meterBalance + +getTransaction.amount;
    const getTariff = getDiscoTariff(getMeterRecord.disco || DiscoEnum.IKEDC);
    newUnitBalance = parseFloat((newBalance / getTariff).toFixed(2));
  }

  try {
    const paymentNotificationTemp = "/templates/meter-topup.ejs";
    const emailTemplate = await ejs.renderFile(`${appRoot}${paymentNotificationTemp}`, {
      userName: paymentMetadata.name,
      meterNumber: paymentMetadata.meterNumber,
      amount: +getTransaction.amount,
      unitsAdded: (+paymentMetadata.units).toFixed(2),
      transactionId: reference,
      rechargeDate: new Date(),
      tariffRate: paymentMetadata.tariff,
      currentBalance: newUnitBalance,
      dashboardUrl: `${frontendBaseUrl}/`,
      paymentMethod: null,
      errorMessage: null,
      last4Digits: null,
      rechargeUrl: `${frontendBaseUrl}/recharge`,
    });
    EmailService.sendMail({
      receiverEmail: paymentMetadata.email,
      subject: "Meter Topup!",
      text: `Your Meter ${paymentMetadata.meterNumber} has been topped up with ${
        paymentMetadata.units
      } units. Your current balance is ${getMeterRecord?.meterBalance || 0}`,
      html: emailTemplate,
    });
  } catch (error) {
    Logger.error("Error sending payment notification email", error);
  }

  const successPage = await redirectPage(TransactionStatus.SUCCESS, {
    paymentDetails: {
      reference,
      transactionId: reference,
      amount: getTransaction.amount,
      meterNumber: paymentMetadata.meterNumber,
    },
    errorMessage: null,
  });

  return res.send(successPage);
}

async function redirectPage(status: "SUCCESS" | "FAILED", extraData: any) {
  const redirectPage = "/templates/payment-feedback.ejs";
  const redirectPageContent = await ejs.renderFile(`${appRoot}${redirectPage}`, { success: status === "SUCCESS" ? true : false, ...extraData });
  return redirectPageContent;
}

function generateTransactionReference() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `TXN${timestamp}${randomNum}`;
}

function generateVendToken(): string {
  return Array.from({ length: 20 }, () => Math.floor(Math.random() * 10).toString()).join("");
}

export function getDiscoTariff(disco: string) {
  let tariff = 0;
  switch (disco) {
    case DiscoEnum.IKEDC:
    case DiscoEnum.EKEDC:
      tariff = +process.env.BAND_A_TARIFF! || 0;
      break
    default:
      tariff = +process.env.BAND_B_TO_E_TARIFF! || 0;
      break;
  }
  return tariff;
}

async function getTransactionRecord(userProfile: IUser, query: any) {
  const getTransaction = await ABSTRACT_SERVICE.getAllData(Transaction, { where: { userId: userProfile.id } });
  return manualDataPagination(getTransaction, query.page, PAGINATION )
}

const MeterManagementService = { addNewMeter, removeMeter, rechargeMeter, verifyPskPayment, getTransactionRecord };
export default MeterManagementService;