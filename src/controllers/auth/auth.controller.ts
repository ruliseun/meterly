import { Request, Response } from "express";
import Logger from "../../utils/logger";
import { matchedData } from "express-validator";
import AuthService from "../../service/auth.service";
import { ILogin, IUser } from "../../interface/user.interface";
import { DeviceTypeEnum, UserStatusEnum } from "../../enums/user-type.enum";
import OTPService from "../../service/otp/otp.service";

const signup = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUser;
  const userAgent = req.headers["user-agent"] || "";
  try {
    const userData = await AuthService.createUser({ userAgent, ...data });

    return res.status(200).json({ status: 200, message: "User created successfully", data: userData });
  } catch (error) {
    Logger.error("Error creating user", error);
    return res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error occured", data: null });
  }
};

const login = async (req: Request, res: Response) => {
  const data = matchedData(req);
  const userAgent = req.headers["user-agent"] as string;
  try {
    const loginUser = await AuthService.loginUser({ userAgent, ...data } as ILogin);

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      data: loginUser,
    });
  } catch (error) {
    Logger.error("Login error:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error occured", data: null });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  let { token, deviceType = DeviceTypeEnum.WEB } = matchedData(req);

  try {
    const tokenRefresh = await AuthService.refresh(token, deviceType);
    return res.status(200).json({ message: "Session refreshed successfully", data: tokenRefresh });
  } catch (error) {
    Logger.error(error);
    return res.status(500).json({ error: true, message: error.message || "Error refreshing token", data: null });
  }
};

const logout = async (req: Request, res: Response) => {
  const { deviceType = DeviceTypeEnum.WEB } = matchedData(req);
  const user = (req as any).user;

  try {
    await AuthService.logout(user, deviceType);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    Logger.error(error);
    return res.status(500).json({ message: "error logging out user", data: null });
  }
};

const forgotPasswordRequest = async (req: Request, res: Response) => {
  const data = matchedData(req) as { [key: string]: string };
  try {
    await AuthService.forgotPasswordRequest(data);

    return res.status(200).json({
      status: 200,
      message: "Password reset otp has been sent to email address",
      data: null
    });
  } catch (error) {
    Logger.error("Error requesting password reset:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error requesting password reset", data: null });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const data = matchedData(req) as { [key: string]: string };
  try {
    await AuthService.resetPassword(data);

    return res.status(200).json({
      status: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    Logger.error("Error reseting password:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error reseting password", data: null });
  }
};

const requestOTP = async (req: Request, res: Response) => {
  const data = matchedData(req);
  try {
    const record = await OTPService.requestOTP(data);
    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: record,
    });
  } catch (error) {
    Logger.error("OTP Request error:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "OTP Request Error", data: null });
  }
};

const validateOTP = async (req: Request, res: Response) => {
  const data = matchedData(req);
  try {
    const record = await OTPService.validateOTP(data);

    if (record.isValid) {
      await AuthService.updateRecord(record.email, { isVerified: true, status: UserStatusEnum.ACTIVE });
    }

    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: record,
    });
  } catch (error) {
    Logger.error("OTP Validation error:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "OTP Validation Error", data: null });
  }
};

const completeOnboarding = async (req: Request, res: Response) => {
  const data = matchedData(req);
  const userAgent = req.headers["user-agent"] || "";
  try {
    const record = await AuthService.completeOnboarding(data as any, userAgent);

    return res.status(200).json({
      status: 200,
      message: "Onboarding completed successfully",
      data: record,
    });
  } catch (error) {
    Logger.error("Error completing onboarding:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error completing onboarding", data: null });
  }
};

const getProfile = async (req: Request, res: Response) => {
  const user = (req as any).profile as IUser;
  try {
    const record = await AuthService.getProfile(user);

    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: record,
    });
  } catch (error) {
    Logger.error("Error getting profile:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error getting profile", data: null });
  }
};

const AuthController = {
  signup,
  login,
  refreshToken,
  logout,
  forgotPasswordRequest,
  resetPassword,
  requestOTP,
  validateOTP,
  completeOnboarding,
  getProfile,
};

export default AuthController;
