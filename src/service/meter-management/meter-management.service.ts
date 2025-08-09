import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { ElectricityMeter } from "../../entity/Meter";
import { IUser } from "../../interface/user.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";

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

const MeterManagementService = { addNewMeter, removeMeter };
export default MeterManagementService;