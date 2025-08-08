import { AppDataSource } from "../data-source";
import Logger from "../utils/logger";

export async function connectDB() {
  return AppDataSource.initialize()
    .then(async () => {
      Logger.info("DB connected Successfully");
    })
    .catch((error) => {
      Logger.error("Database connection error", error);
      throw error;
    });
}
