import { RefreshToken } from "../../entity/Token";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { ElectricityMeter } from "../../entity/Meter";

export const USER_MODEL = AppDataSource.getRepository(User);
export const REFRESH_TOKEN_MODEL = AppDataSource.getRepository(RefreshToken);
export const ELECTRICITY_METER_MODEL = AppDataSource.getRepository(ElectricityMeter);