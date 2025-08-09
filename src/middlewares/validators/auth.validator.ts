import { check } from "express-validator";
import { passwordStrength } from "../../config/constants";

export const validateLogin = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password").exists().withMessage("Password is required").notEmpty().withMessage("Password cannot be empty"),
  check("deviceType")
    .optional()
    .isString()
    .withMessage("Device type must be a string")
    .toUpperCase()
    .isIn(["WEB", "APP"])
    .trim(),
];

export const validateLogout = [ check("") ];

export const validateCreateUser = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email address"),
  
  check("password")
    .exists()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isString()
    .withMessage("Password must be a string")
    .custom(async (value) => {
      const validPassword = await passwordStrength(value);
      if (!validPassword) {
        throw new Error(
          "Password must contain atleast 8 characters including one uppercase letter, one lower case letter, one number and one character",
        );
      }
      return true;
    })
    .trim(),
];

export const validateCompleteOnboarding = [
  check("fullName")
    .exists()
    .withMessage("Full name is required")
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .isString()
    .withMessage("Full name must be a string")
    .trim(),

  check("phone")
    .exists()
    .withMessage("Phone number is required")
    .notEmpty()
    .withMessage("Phone number cannot be empty")
    .isString()
    .withMessage("Phone number must be a string")
    .trim(),

  check("nin")
    .exists()
    .withMessage("NIN is required")
    .notEmpty()
    .withMessage("NIN cannot be empty")
    .isString()
    .withMessage("NIN must be a string")
    .isLength({ min: 11, max: 11 })
    .withMessage("NIN must be exactly 11 characters long")
    .trim(),

  check("address")
    .exists()
    .withMessage("Address is required")
    .notEmpty()
    .withMessage("Address cannot be empty")
    .isString()
    .withMessage("Address must be a string")
    .trim(),

  check("meter.meterNumber")
    .exists()
    .withMessage("Meter number is required")
    .notEmpty()
    .withMessage("Meter number cannot be empty")
    .isString()
    .withMessage("Meter number must be a string")
    .trim(),

  check("meter.meterName")
    .optional()
    .notEmpty()
    .withMessage("Meter name cannot be empty")
    .isString()
    .withMessage("Meter name must be a string")
    .trim(),

  check("meter.meterAddress")
    .optional()
    .notEmpty()
    .withMessage("Meter address cannot be empty")
    .isString()
    .withMessage("Meter address must be a string")
    .trim(),

  check("meter.meterType")
    .exists()
    .withMessage("Meter type is required")
    .notEmpty()
    .withMessage("Meter type cannot be empty")
    .isString()
    .withMessage("Meter type must be a string")
    .toUpperCase()
    .isIn(["PREPAID", "POSTPAID"])
    .withMessage("Invalid meter type")
    .trim(),

  check("meter.disco")
    .exists()
    .withMessage("Disco is required")
    .notEmpty()
    .withMessage("Disco cannot be empty")
    .isString()
    .withMessage("Disco must be a string")
    .toUpperCase()
    .isIn(["EKEDC", "IKEDC", "AEDC", "IBEDC", "PHEDC", "JEDC", "KEDC", "BEDC"])
    .withMessage("Invalid disco. Disco must be one of EKEDC, IKEDC, AEDC, IBEDC, PHEDC, JEDC, KEDC, BEDC")
    .trim(),
];

export const refeshTokenValidator = [
  check("token").exists().withMessage("Token is required").isString().withMessage("Invalid JWT token").trim(),
];

export const verifyEmailTokenValidator = [
  check("token").exists().withMessage("Email token is required").isString().withMessage("Invalid email token"),
];

export const validateEmail = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email"),
];

export const validateResetPassword = [
  check("code")
    .exists()
    .withMessage("Code is required")
    .notEmpty()
    .withMessage("Code cannot be empty")
    .isString()
    .withMessage("Code must be string")
    .trim(),
  check("password")
    .exists()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isString()
    .withMessage("Password must be a string")
    .custom(async (value) => {
      const validPassword = await passwordStrength(value);
      if (!validPassword) {
        throw new Error(
          "Password must contain atleast 8 characters including one uppercase letter, one lower case letter, one number and one character",
        );
      }
      return true;
    })
    .trim(),
];

export const requestOTPValidator = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email"),

  check("requestId")
    .optional()
    .notEmpty()
    .withMessage("requestId cannot be empty")
    .isString()
    .withMessage("requestId must be a string")
    .trim(),
];

export const validateOTPValidator = [
  check("otp")
    .exists()
    .withMessage("otp is required")
    .notEmpty()
    .withMessage("otp cannot be empty")
    .isString()
    .withMessage("otp must be a string")
    .trim(),

  check("requestId")
    .exists()
    .withMessage("requestId is required")
    .notEmpty()
    .withMessage("requestId cannot be empty")
    .isString()
    .withMessage("requestId must be a string")
    .trim(),
];
