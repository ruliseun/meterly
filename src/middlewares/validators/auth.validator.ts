import { check } from "express-validator";

export const validateLogin = [ check("")];

export const validateLogout = [ check("") ];

export const validateCreateUser = [ check("") ]

export const refeshTokenValidator = [
  check("token").exists().withMessage("Token is required").isString().withMessage("Invalid JWT token").trim(),
];

export const verifyEmailTokenValidator = [
  check("token").exists().withMessage("Email token is required").isString().withMessage("Invalid email token"),
];

export const validateEmail = [check("")];

export const validateResetPassword = [ check("") ]

export const requestOTPValidator = [check("")];

export const validateOTPValidator = [check("")];
