import bcrypt from "bcryptjs";
import { baseApiURL, nodeEnv } from "../config/env";
import countries from "./constants/countries";

export const APP_URLS = {
  baseApiURL: baseApiURL,
};

export const appVersion = "v1";

export const BCRYPT_SALT = 10;
export const PAGINATION = 10;

export const harshPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(BCRYPT_SALT);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = async (password: string, hashPassword: string) => {
  return bcrypt.compareSync(password, hashPassword);
};

export const passwordStrength = async (password: string) => {
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^.?])(?=.{8,})");
  return strongRegex.test(password);
};

export const getCountryCode = async (country: string) => {
  const requestCountry = countries.find((c) => c.name.toLowerCase() === country.toLowerCase());
  return { countryCode: requestCountry?.dialCode, currencyCode: requestCountry?.currencyCode };
};

export const validateEmailTest = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/* eslint-disable no-console */
export function getAppVersion() {
  const today = new Date();
  const nowUTC = new Date(today.toISOString());

  const appInfo = {
    Name: "Meterly",
    Version: appVersion,
    Released: nowUTC.toISOString(),
    environment: nodeEnv,
  };

  console.log("\x1b[1m\nApp Information\x1b[0m");
  console.table([appInfo]);
  console.log("\n");
  return;
}
