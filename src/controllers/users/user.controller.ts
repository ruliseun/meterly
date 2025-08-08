import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import UserService from "../../service/users/user.service";

const getUser = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 200,
      message: "User data retrieved successfully",
      data: [],
    });
  } catch (error) {
    Logger.error("Error getting user:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error getting user", data: null });
  }
};

const updateUserRecord = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 200,
      message: "User data updated successfully",
      data: [],
    });
  } catch (error) {
    Logger.error("Error updating record:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error updating user", data: null });
  }
};


const getUserProfile = async (req: Request, res: Response) => {
  const { token } = matchedData(req);
  const user = (req as any).user;
  try {
    const profile = await UserService.getUserProfile(user, token);
    return res.status(200).json({
      status: 200,
      message: "User profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    Logger.error("Error retrieving user profile:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error retrieving user profile", data: null });
  }
};

const UserController = {
  getUser,
  updateUserRecord,
  getUserProfile,
};

export default UserController;
