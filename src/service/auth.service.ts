/* eslint-disable complexity */
import { comparePassword, harshPassword, passwordStrength } from "../config/constants";
import { User } from "../entity/User";
import { ILogin, IUser } from "../interface/user.interface";
import ABSTRACT_SERVICE, { createError } from "./abstractService/abstractService";
import TokenService from "./token.service";
import { USER_MODEL } from "../config/database/db";
import { ResponseCodeEnum } from "../enums/response-codes.enum";
import OTPService from "./otp/otp.service";
import Logger from "../utils/logger";
import { DiscoEnum, ElectricityMeter } from "../entity/Meter";
import { toSentenceCase } from "../utils/formater";
import ejs from "ejs";
import { appRoot } from "../app";
import { frontendBaseUrl } from "../config/env";
import EmailService from "./email/email.service";
import { UserStatusEnum } from "../enums/user-type.enum";
import { getDiscoTariff } from "./meter-management/meter-management.service";

type UserData = {
  fullName?: string;
  phone?: string;
  nin?: string;
  address?: string;
  meter?: Partial<ElectricityMeter>;
  [key: string]: any;
};

async function createUser(data: IUser) {
  const { password, email } = data;

  const uniqueUserQuery = { where: [{ email }] };
  const userExist = await ABSTRACT_SERVICE.getAllData(User, uniqueUserQuery);
  if (userExist?.length) {
    throw createError("User with email already exists", ResponseCodeEnum.BAD_REQUEST);
  }

  let hashPassword = null;
  if (password) {
    const validatePasswordStrength = await passwordStrength(password);
    if (!validatePasswordStrength) {
      throw createError("Password is too weak", ResponseCodeEnum.BAD_REQUEST);
    }
    hashPassword = await harshPassword(password);
  }

  const createUser = await ABSTRACT_SERVICE.createData(User, { ...data, password: hashPassword });

  if (!createUser) {
    throw createError("Error creating user", ResponseCodeEnum.INTERNAL_SERVER_ERROR);
  }

  const requestId = await OTPService.requestOTP({ email, reset: true });

  return {
    ...createUser,
    password: undefined,
    isVerified: false,
    password_reset: undefined,
    requestId: requestId.requestId,
    id: undefined,
  };
}

async function loginUser(data: ILogin) {
  const { email, password, deviceType = "WEB", userAgent } = data;

  const getUser = await ABSTRACT_SERVICE.findAndPopulate(User, { email }, []);

  if (!getUser) {
    throw createError("Invalid login credential", ResponseCodeEnum.UNAUTHORIZED);
  }

  if (getUser.status !== UserStatusEnum.ACTIVE) {
    throw createError("Account not active", ResponseCodeEnum.UNAUTHORIZED);
  }

  const validatePassword = await comparePassword(password, getUser.password);

  if (!validatePassword) {
    throw createError("Invalid login credential", ResponseCodeEnum.UNAUTHORIZED);
  }

  const loginResponse = await login(getUser, userAgent, deviceType);
  getUser.lastLogin = new Date();
  await USER_MODEL.save(getUser);

  const { user, ...userDetails } = loginResponse as unknown as Partial<IUser>;

  return {
    ...userDetails,
    user: {
      ...user,
      id: undefined,
      password: undefined,
      password_reset: undefined,
      deviceType,
    },
  };
}

async function forgotPasswordRequest(data: { [key: string]: string }) {
  const { email } = data;

  const getUser = await ABSTRACT_SERVICE.getUniqueData(User, { email });

  if (!getUser) {
    throw createError("Account with associated email not found", ResponseCodeEnum.NOT_FOUND);
  }

  const reset_otp = await OTPService.generateVerificationOTP();

  const updates = {
    password_reset: {
      initiated: true,
      otp: reset_otp,
      date: new Date(),
    },
  };

  const updateModel = await ABSTRACT_SERVICE.updateById(User, getUser.id, updates);

  if (!updateModel.affected) {
    const error = new Error("Error sending OTP");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  return await OTPService.sendOTP(email, reset_otp, "password_reset");
}

async function resetPassword(data: { [key: string]: string }) {
  const { email, code, password } = data;

  const getUser = await ABSTRACT_SERVICE.getUniqueData(User, { email });

  if (!getUser) {
    throw createError("Account with associated email not found", ResponseCodeEnum.NOT_FOUND);
  }

  if (getUser.password_reset && getUser.password_reset.initiated) {
    const resetDate = new Date(getUser.password_reset.date);
    const OTPExpired = await OTPService.hasOTPExpired(resetDate);

    if (OTPExpired) {
      throw createError("OTP has expired", ResponseCodeEnum.BAD_REQUEST);
    }

    if (getUser.password_reset.otp !== code) {
      throw createError("Invalid OTP", ResponseCodeEnum.BAD_REQUEST);
    }
  }

  const validatePasswordStrength = await passwordStrength(password);

  if (!validatePasswordStrength) {
    throw createError("Password is too weak", ResponseCodeEnum.BAD_REQUEST);
  }

  const harshedPassword = await harshPassword(password);

  const updateRecord = await ABSTRACT_SERVICE.updateById(User, getUser.id, {
    password: harshedPassword,
    status: UserStatusEnum.ACTIVE,
    password_reset: { initiated: null, otp: null, date: null },
  });

  if (!updateRecord.affected) {
    const error = new Error("Error updating password");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  return;
}

async function completeOnboarding(data: { token: string } & UserData, userAgent: string) {
  const { token, ...userData } = data;
  const { meter, ...userInfo } = userData;

  let decodeToken: string;
  try {
    decodeToken = atob(token);
  } catch (e) {
    throw createError("Invalid email token", ResponseCodeEnum.BAD_REQUEST);
  }

  const getUser = await ABSTRACT_SERVICE.getUniqueData(User, { email: decodeToken });

  if (!getUser) {
    throw createError("User not found", ResponseCodeEnum.NOT_FOUND);
  }

  let userPayload: Record<string, any> = {};
  let meterPayload: Record<string, any> = {};

  for (const key in userInfo) {
    if (userInfo[key]) {
      userPayload[key] = userInfo[key];
    }
  }

  if (meter) {
    for (const key in meter) {
      const meterKey = key as keyof ElectricityMeter;
      if (meter[meterKey]) {
        meterPayload[key] = meter[meterKey];
      }
    }
  }

  await updateRecord(getUser.email, { ...userPayload, loginUser: true });
  await ABSTRACT_SERVICE.createData(ElectricityMeter, {
    ...meterPayload,
    user: getUser,
  });

  const loginUser = await login(getUser, userAgent, "WEB");
  const { user, ...userDetails } = loginUser as unknown as Partial<IUser>;

  try {
    const userName = toSentenceCase(userPayload?.fullName || "There");
    const welcomeEmailTemplate = "/templates/signup-welcome.ejs";

    const emailTemplate = await ejs.renderFile(`${appRoot}${welcomeEmailTemplate}`, {
      userName,
      dashboardUrl: `${frontendBaseUrl}/app`,
    });

    await EmailService.sendMail({
      receiverEmail: getUser?.email,
      subject: "Welcome to Meterly",
      text: "Welcome!",
      html: emailTemplate,
    });
  } catch (error) {
    Logger.error("Error sending welcome email:::", error);
  }

  return {
    ...userDetails,
    user: {
      ...user,
      id: undefined,
      password: undefined,
      password_reset: undefined,
      deviceType: "APP",
    },
  };
}

async function updateRecord(user: string, data: { [key: string]: string | boolean | Date }) {
  const userRecord = await ABSTRACT_SERVICE.getUniqueData(User, { email: user });

  if (!userRecord) {
    throw createError("User not found", ResponseCodeEnum.NOT_FOUND);
  }

  if (data.loginUser) {
    data.lastLogin = new Date();
  }

  delete data.password;
  delete data.email;
  delete data.id;

  Object.assign(userRecord, data);
  return await USER_MODEL.save(userRecord);
}

async function getProfile(userProfile: IUser) {
  const updatedMeters = userProfile.electricityMeters.map((meter: any) => {
    const getTariff = getDiscoTariff(meter.disco || DiscoEnum.IKEDC);
    return {
      ...meter,
      units: +meter.meterBalance > 0 ? parseFloat((+meter.meterBalance / getTariff).toFixed(2)) : 0.00
    };
  });
  return {
    ...userProfile,
    electricityMeters: updatedMeters,
    password: undefined,
    password_reset: undefined,
    updatedAt: undefined,
  };
}

export const login = async (user: Partial<IUser>, userAgent: string, deviceType: string) => {
  const refreshTokenPromise = TokenService.generateRefreshToken(user, userAgent, deviceType);
  const [refreshToken, { jwtid }] = await Promise.all([
    refreshTokenPromise,
    refreshTokenPromise.then(TokenService.decodeRefreshToken),
  ]);

  const { accessToken, expiresIn } = await TokenService.generateAccessToken(user, jwtid, deviceType);

  return buildResponse({ accessToken, refreshToken, expiresIn, user });
};

const refresh = async (refreshToken: string, deviceType: string) => {
  const data = (await TokenService.generateAccessTokenFromRefreshToken(refreshToken, deviceType)) as {
    accessToken: string;
    expiresIn: number;
  };

  return buildResponse({ accessToken: data.accessToken, expiresIn: data.expiresIn });
};

const logout = async (user: string, deviceType: string) => {
  return await TokenService.deleteRefreshToken(user, deviceType);
};

const buildResponse = ({
  accessToken,
  refreshToken,
  expiresIn,
  user,
}: {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number | null;
  user?: Partial<IUser>;
}) => {
  return {
    accessToken,
    refreshToken,
    expiresIn,
    ...(user && { user }),
  };
};

const AuthService = {
  login,
  refresh,
  logout,
  createUser,
  loginUser,
  forgotPasswordRequest,
  resetPassword,
  updateRecord,
  completeOnboarding,
  getProfile,
};

export default AuthService;
