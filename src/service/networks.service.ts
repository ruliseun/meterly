import axios from "axios";
import { INetworkCall } from "../interface/network.interface";
import Logger from "../utils/logger";
import DeviceDetector from "node-device-detector";
import DeviceHelper from "node-device-detector/helper";

export async function makeNetworkCall({ url, method, payload, headers }: INetworkCall): Promise<any> {
  try {
    const response = await axios({
      url,
      method,
      data: payload,
      headers,
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    Logger.error("Network Error :::", error);
    return {
      error: true,
      status: "error",
      message: error?.response?.data?.message,
    };
  }
}

export async function getDeviceType(userAgent: string) {
  const detector = new DeviceDetector();

  const result = detector.detect(userAgent);

  if (result.client.type && result.client.type === "library") return true;

  return DeviceHelper.isMobile(result);
}
