// eslint-disable no-case-declarations
import otpGenerator from "otp-generator";
import Logger from "../../utils/logger";
import EmailService from "../email/email.service";
import { appRoot } from "../../app";
import ejs from "ejs";
import { frontendBaseUrl } from "../../config/env";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import { User } from "../../entity/User";
import { OTPVerificationModel } from "../../entity/otp.model";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { IUser } from "../../interface/user.interface";

async function generateVerificationOTP(): Promise<string> {
  try {
    return otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
  } catch (error) {
    Logger.error("Error generating OTP", error);
    throw error;
  }
}

async function sendOTP(
  receiverEmail: string,
  code: string,
  type: "password_reset" | "request_otp",
  _data?: { [key: string]: string },
): Promise<void> {
  let emailTemplate = "";

  /* eslint-disable no-case-declarations */
  switch (type) {
    case "password_reset":
      const resetPasswordTemplatePath = "/templates/reset-password.ejs";
      const token = btoa(receiverEmail);
      emailTemplate = await ejs.renderFile(`${appRoot}${resetPasswordTemplatePath}`, {
        otp: code,
        reset_password_url: `${frontendBaseUrl}/forgot-password?token=${token}`,
      });
      break;
    case "request_otp":
      const requestOTPTemplatePath = "/templates/otp-request.ejs";
      emailTemplate = await ejs.renderFile(`${appRoot}${requestOTPTemplatePath}`, {
        otp: code,
      });
      break;
  }

  try {
    await EmailService.sendMail({
      receiverEmail,
      subject: type === "request_otp"
          ? `OTP for ${receiverEmail}`
          : "Action Required!",
      text: "Message Alert!",
      html: emailTemplate,
    });
    return;
  } catch (error) {
    Logger.error("error sending email", error);
  }
}

async function hasOTPExpired(date: Date): Promise<boolean> {
  const now = new Date();
  const resetDate = date;

  const differenceInMilliseconds = now.getTime() - resetDate.getTime();

  const fiveMinutesInMilliseconds = 5 * 60 * 1000;

  return differenceInMilliseconds > fiveMinutesInMilliseconds;
}

async function requestOTP(data: { [key: string]: unknown }) {
  const { email, requestId, reset = false } = data;

  const validateUser = await ABSTRACT_SERVICE.getUniqueData(User, { email }) as IUser;

  if (!validateUser) {
    throw createError("User not found", ResponseCodeEnum.NOT_FOUND);
  }

  let token: any = null;
  let otp: string;

  if (requestId) {
    const existingRecord = await OTPVerificationModel.findOne({ requestId });
    if (existingRecord) {
      otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
      existingRecord.code = otp;
      existingRecord.is_valid = true;
      await existingRecord.save();
      token = existingRecord;
    } else {
      throw createError("Request ID not found", ResponseCodeEnum.BAD_REQUEST);
    }
  } else {
    const existingRecord = await OTPVerificationModel.findOne({ email });
    if (existingRecord && !reset) {
      throw createError("OTP has already been sent. Please use the existing request ID.", ResponseCodeEnum.BAD_REQUEST);
    }

    const newRequestId = otpGenerator.generate(10, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    const newToken = await OTPVerificationModel.create({ requestId: newRequestId, otp, email });

    if (!newToken) {
      throw createError("Error generating OTP", ResponseCodeEnum.BAD_REQUEST);
    }
    token = newToken.toObject();
  }

  if (token) {
    await sendOTP(email as string, otp, "request_otp");
  }

  return { requestId: token.requestId };
}

async function validateOTP(data: { [key: string]: unknown }) {
  const { otp, requestId } = data;

  const otpRecord = await OTPVerificationModel.findOne({ otp, requestId });

  if (!otpRecord || !otpRecord.isValid) {
    throw createError("Invalid or expired OTP", ResponseCodeEnum.BAD_REQUEST);
  }

  await OTPVerificationModel.findByIdAndUpdate(otpRecord._id, { $set: { isValid: false } }, { new: true });

  return { isValid: true, requestId: otpRecord.requestId, otpType: "Email", email: otpRecord.email };
}

const OTPService = { generateVerificationOTP, sendOTP, hasOTPExpired, requestOTP, validateOTP };

export default OTPService;
