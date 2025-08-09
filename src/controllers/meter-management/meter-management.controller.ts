import Logger from "../../utils/logger";
import { Request, Response } from "express";
import { matchedData } from "express-validator";
import MeterManagementService from "../../service/meter-management/meter-management.service";
import { IUser } from "../../interface/user.interface";

const addNewMeter = async (req: Request, res: Response) => {
  const data = matchedData(req);
  const user = (req as any).profile as IUser;
  try {
    await MeterManagementService.addNewMeter(user, data);

    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error adding new meter:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error adding new meter", data: null });
  }
};

const removeMeter = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  const user = (req as any).profile as IUser;
  try {
    await MeterManagementService.removeMeter(user, id);

    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error removing meter:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error removing meter", data: null });
  }
};


const MeterManagementController = {
  addNewMeter,
  removeMeter,
};
export default MeterManagementController;