/* eslint-disable complexity */
import { comparePassword } from "../config/constants";
import { User } from "../entity/User";
import { ILogin, IUser } from "../interface/user.interface";
import ABSTRACT_SERVICE from "./abstractService/abstractService";
import TokenService from "./token.service";
import { USER_MODEL } from "../config/database/db";

async function createUser(_data: IUser) {
  return {};
}

async function resendVerificationEmail(_data: { [key: string]: any }) {
  return {};
}

async function loginUser(data: ILogin) {
  const { email, password, deviceType = "WEB", userAgent } = data;

  const getUser = await ABSTRACT_SERVICE.findAndPopulate(User, { email }, []);

  if (!getUser) {
    const error = new Error("User not found");
    (error as any).httpStatusCode = 404;
    throw error;
  }

  if (!getUser.password) {
    const error = new Error("Password reset is required");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const validatePassword = await comparePassword(password, getUser.password);

  if (!validatePassword) {
    const error = new Error("Invalid login credential");
    (error as any).httpStatusCode = 401;
    throw error;
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

async function forgotPasswordRequest(_data: { [key: string]: string }) {
  return true
}

async function resetPassword(_data: { [key: string]: string }) {
  return true
}

export async function sendVerificationEmail(_data: { [key: string]: string }) {
  return true
}

async function verifyProfileEmail(_data: string) {
  return true;
}

async function updateRecord(_orgId: number, _data: { [key: string]: string | number }) {
  return true;
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
  sendVerificationEmail,
  verifyProfileEmail,
  updateRecord,
  resendVerificationEmail,
};

export default AuthService;
