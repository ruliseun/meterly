import winston from "winston";
import { nodeEnv } from "../config/env";
import { Environments } from "../enums/env.enum";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.simple(),
  winston.format.label({ label: "Bethel Flow" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.user_id ? `User ID: ${info.user_id}, ` : ""} ${info.message}`,
  ),
);

const fileName = nodeEnv === Environments.PRODUCTION ? "log/activity.log" : "log/activity-dev.log";

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize({ all: true }), format),
  }),
  new winston.transports.File({ filename: fileName, format }),
];

const Logger = winston.createLogger({
  levels,
  format,
  transports,
});

const originalError = Logger.error.bind(Logger);
(Logger as any).error = (message: string, error?: Error, ...args: any[]) => {
  originalError(message, error, ...args);
  const errorObj = error || new Error(message);
  console.error("Error:::", errorObj);
};

export default Logger;
