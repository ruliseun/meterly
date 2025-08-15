import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import "reflect-metadata";

dotenv.config({ path: path.join(__dirname, "../.env") });
import { handleError } from "./helpers/error";
import httpLogger from "./middlewares/httpLogger";

export const appRoot = path.resolve();
import initializeRoutes from "./routes";
import { appVersion, getAppVersion } from "./config/constants";
import { Environments } from "./enums/env.enum";
import { nodeEnv } from "./config/env";
import Logger from "./utils/logger";
import { AppDataSource } from "./data-source";
import { connectAuditDB, connectDB } from "./config/database";
import { startScheduler } from "./utils/scheduler";

const app: express.Application = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true,
  }),
);

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

initializeRoutes(app);

// catch 404 and forward to error handler
app.use((req, res) => {
  const method = req.method;
  res.status(404).json({
    status: "error",
    message: "Route Not Found",
    error: `Cannot ${method} ${req.url?.split(`api/${appVersion}`)[1] || ""}`,
  });
});

// error handler
const errorHandler: express.ErrorRequestHandler = (err, _req, res) => {
  handleError(err, res);
};
app.use(errorHandler);

const port = process.env.PORT || 3012;
app.set("port", port);

const server = http.createServer(app);

let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

async function onListening() {
  await connectDB();
  if (nodeEnv === Environments.STAGING || nodeEnv === Environments.PRODUCTION) {
    try {
      Logger.info("Running database migrations...");
      await AppDataSource.runMigrations();
      Logger.info("Database migrations completed");
    } catch (error) {
      Logger.error("Error running database migrations:", error);
    }
  }
  await connectAuditDB();
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
  console.info(`Server is listening on ${bind}`);
  getAppVersion();
  await startScheduler();
}
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
