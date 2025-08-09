import dotenv from "dotenv";
import { IEnv } from "../interface/environment.interface";

dotenv.config();

export const nodeEnv = process.env.NODE_ENV;

// APP URL
export const baseApiURL = process.env.BASE_API_URL;

// DATABASE
export const databaseURL = process.env.DATABASE_URL;
export const databaseName = process.env.DATABASE_NAME;
export const databaseUser = process.env.DATABASE_USER;
export const databasePassword = process.env.DATABASE_PASSWORD;
export const databasePort = process.env.DATABASE_PORT;
export const databaseHost = process.env.DATABASE_HOST;
export const localDatabaseUserName = process.env.LOCAL_DATABASE_NAME;
export const localDatabasePassword = process.env.LOCAL_DATABASE_PASSWORD;

// API KEY
export const API_KEY = process.env.API_KEY;

// EMAIL
export const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
export const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

// AUTHENTICATION
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.AUTH_ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = process.env.AUTH_REFRESH_TOKEN_EXPIRY;

// FRONTEND
export const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

//EMAIL
export const emailUser = process.env.EMAIL_USER;
export const emailPassword = process.env.EMAIL_PASSWORD;

export const TOKENS = {
  auth_token_secret: AUTH_TOKEN_SECRET,
  access_token_expiry: ACCESS_TOKEN_EXPIRY,
  refresh_token_expiry: REFRESH_TOKEN_EXPIRY,
};

(() => {
  const requiredEnvs: IEnv = {
    nodeEnv,
    databaseURL,
    databaseName,
    databaseHost,
    databaseUser,
    databasePassword,
    databasePort,
    baseApiURL,
    API_KEY,
    AUTH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    frontendBaseUrl,
    emailUser,
    emailPassword,
  };

  const missing = Object.keys(requiredEnvs)
    .map((variable) => {
      if (!requiredEnvs[variable as keyof typeof requiredEnvs]) return variable;
      return "";
    })
    .filter((val) => val.length);

  if (missing.length) {
    console.error("[MISSING ENV VARIABLES]:\n", missing);
  }
})();
