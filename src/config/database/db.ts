import { RefreshToken } from "../../entity/Token";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";

export const USER_MODEL = AppDataSource.getRepository(User);
export const REFRESH_TOKEN_MODEL = AppDataSource.getRepository(RefreshToken);