import mongoose from "mongoose";
import { AppDataSource } from "../data-source";
import Logger from "../utils/logger";
import { databaseURL } from "./env";

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

export async function connectAuditDB() {
  mongoose.Promise = global.Promise;

  const connectionString = databaseURL || ("" as string);

  try {
    await mongoose.connect(connectionString);
    Logger.info("\n[MONGO]: DB[2] connected Successfully");
    Logger.info(`[MONGO]: Database URL: ${connectionString}\n`);
  } catch (err) {
    Logger.error(`\n[MONGO]: Could not connect to the database\n${err}\nExiting now...`, err);
  }
}
