import { check, param } from "express-validator";

export const validateCustomRequest = (args: string[]) => {
  return args.map((option) => {
    return check(option)
      .exists()
      .withMessage(`${option} is required`)
      .notEmpty()
      .withMessage(`${option} cannot be empty`)
      .isString()
      .withMessage(`${option} must be a string`)
      .trim();
  });
};

export const validateRequiredId = (field: string) => {
  return [
    check(field)
      .exists()
      .withMessage(`${field} is required`)
      .isNumeric()
      .withMessage(`${field} must be a number`)
      .trim(),
  ];
};
export const validateRequiredUuid = (field: string) => [
  check(field)
    .exists({ checkFalsy: true })
    .withMessage(`${field} is required`)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`)
    .trim(),
];

export const validateOptionalField = (field: string) => {
  return [check(field).optional().isString().withMessage(`${field} must be a string`).trim()];
};

export const validateRequiredField = (field: string) => {
  return [
    check(field)
      .exists()
      .withMessage(`${field} is required`)
      .notEmpty()
      .withMessage(`${field} cannot be empty`)
      .isString()
      .withMessage(`${field} must be a string`)
      .trim(),
  ];
};

export const validateRequiredParams = (params: string[]) => {
  return params.map((paramName) => {
    return param(paramName)
      .exists()
      .withMessage(`${paramName} is required`)
      .notEmpty()
      .withMessage(`${paramName} cannot be empty`)
      .isString()
      .withMessage(`${paramName} must be a string`)
      .trim();
  });
};

export const validateOptionalFields = (fields: string[]) => {
  return fields.map((field) => {
    return check(field).optional().isString().withMessage(`${field} must be a string`).trim();
  });
};

export const validateRequiredEmail = (field: string) => {
  return [
    check(field)
      .exists()
      .withMessage(`${field} is required`)
      .isEmail()
      .withMessage(`${field} must be a valid email`)
      .trim(),
  ];
};

export const customPaginationValidator = [check("page").optional().isNumeric().withMessage("Page must be a number")];

export const getLogsValidator = [
  check("limit").optional().isNumeric().withMessage("Limit must be a number"),
  check("page").optional().isNumeric().withMessage("Page must be a number"),
  check("limit").optional().isNumeric().withMessage("Limit must be a number"),
  check("path").optional().isString().withMessage("Path must be a string"),
  check("orgId").optional().isNumeric().withMessage("Org Id must be a number"),
];

export const sanitizeMonth = (input: string | number | Date): Date => {
  if (input == null) {
    throw new Error("Date input cannot be null or undefined");
  }

  const date = new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Use YYYY-MM, YYYY-MM-DD, or a full ISO format");
  }

  const year = date.getUTCFullYear();
  if (year < 2000 || year > 9999) {
    throw new Error("Year must be between 2000 and 9999");
  }

  return new Date(Date.UTC(year, date.getUTCMonth(), 1));
};
