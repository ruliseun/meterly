import Logger from "../../utils/logger";
import { Request, Response } from "express";
import { matchedData } from "express-validator";
import MeterManagementService from "../../service/meter-management/meter-management.service";
import { IUser } from "../../interface/user.interface";
import VTService from "../../service/vt.service";

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

const verifyMeterNumber = async (req: Request, res: Response) => {
  const { meterNumber, disco, meterType = "prepaid" } = matchedData(req);
  try {
    const response = await VTService.verifyMeterNumber({ meterNumber, disco, meterType });

    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: response,
    });
  } catch (error) {
    Logger.error("Error verifying meter number:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error verifying meter number", data: null });
  }
};

const rechargeMeter = async (req: Request, res: Response) => {
  const data = matchedData(req) as { amount: number; meterNumber: string; }
  const user = (req as any).profile as IUser;
  try {
    const paymentLink = await MeterManagementService.rechargeMeter(user, data);

    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: paymentLink,
    });
  } catch (error) {
    Logger.error("Error recharging meter:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error recharging meter", data: null });
  }
};

const verifyPskPayment = async (req: Request, res: Response) => {
  const { reference } = matchedData(req);
  try {
    return await MeterManagementService.verifyPskPayment(reference, res);
  } catch (error) {
    Logger.error("Error verifying psk payment:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error verifying psk payment", data: null });
  }
}

const getTransactionRecord = async (req: Request, res: Response) => {
  const { page } = matchedData(req);
  const user = (req as any).profile as IUser;
  try {
    const query = { page: +page || 1 }
    const response = await MeterManagementService.getTransactionRecord(user, query);

    return res.status(200).json({
      status: 200,
      message: "Request Completed successfully",
      data: response,
    });
  } catch (error) {
    Logger.error("Error getting transaction record:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error getting transaction record", data: null });
  }
}

const MeterManagementController = {
  addNewMeter,
  removeMeter,
  verifyMeterNumber,
  rechargeMeter,
  verifyPskPayment,
  getTransactionRecord,
};
export default MeterManagementController;