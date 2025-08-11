import { check, query } from "express-validator";

export const registerNewMeter = [
  check("meterNumber")
    .exists()
    .withMessage("Meter number is required")
    .notEmpty()
    .withMessage("Meter number cannot be empty")
    .isString()
    .withMessage("Meter number must be a string")
    .trim(),

  check("meterName")
    .optional()
    .notEmpty()
    .withMessage("Meter name cannot be empty")
    .isString()
    .withMessage("Meter name must be a string")
    .trim(),

  check("meterAddress")
    .optional()
    .notEmpty()
    .withMessage("Meter address cannot be empty")
    .isString()
    .withMessage("Meter address must be a string")
    .trim(),

  check("meterType")
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

  check("disco")
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

export const validateTopUp = [
  check("meterNumber")
    .exists()
    .withMessage("Meter number is required")
    .notEmpty()
    .withMessage("Meter number cannot be empty")
    .isString()
    .withMessage("Meter number must be a string")
    .trim(),

  check("amount")
    .exists()
    .withMessage("Amount is required")
    .notEmpty()
    .withMessage("Amount cannot be empty")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => {
      if (value < 100) {
        throw new Error("Amount must be greater than 100");
      }
      return true;
    }),
];

export const validatePaginationRequest = [
  check("page")
    .optional()
    .isNumeric()
    .withMessage("Page must be a number")
]

export const validatePskPayment = [
  query("trxref").exists().withMessage("trxref is required").isString().withMessage("trxref must be a string").trim(),
  query("reference")
    .exists()
    .withMessage("reference is required")
    .isString()
    .withMessage("reference must be a string")
    .trim(),
];