import { baseApiURL, frontendBaseUrl, PSK_SECRET } from "../config/env";
import { makeNetworkCall } from "./networks.service";

interface IPaystackPaymentData {
  tx_ref: string;
  amount: number;
  metadata: {
    amount: number;
    meterNumber: string;
    units: number;
    userId: number;
    meterId: number;
    email: string;
    name: string;
    tariff: number;
  };
  customer: {
    email: string;
    name: string;
  };
}

export const getPaystackHeaders = () => {
   const headers = {
     Authorization: `Bearer ${PSK_SECRET}`,
     "Content-Type": "application/json",
   };
   return headers;
}

async function generatePaymentLink(data: IPaystackPaymentData) {
   const buildPayload = {
      ...data.customer,
     amount: Math.ceil(+data.amount * 100),
     currency: "NGN",
     reference: data.tx_ref,
     transactionID: data.tx_ref,
     callback_url: `${baseApiURL}/meter_management/verify_payment`,
     channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
     metadata: {
       ...data.metadata,
       cancel_action: `${frontendBaseUrl}`,
     },
   };

   const headers = getPaystackHeaders()

   const paymentData = await makeNetworkCall({
     url: "https://api.paystack.co/transaction/initialize",
     method: "POST",
     payload: buildPayload,
     headers,
   });
   return paymentData?.data?.data?.authorization_url;
}

const PaystackService = {
  generatePaymentLink,
};

export default PaystackService