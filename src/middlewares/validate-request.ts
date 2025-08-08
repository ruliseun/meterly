import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors: { [key: string]: string } = {};

    const keys = Object.keys(errors.mapped());
    const values = Object.values(errors.mapped());

    keys.forEach((key, index) => {
      extractedErrors[key] = values[index].msg;
    });

    return res.status(400).send({ status: "Failed", errors: extractedErrors });
  }
  next();
};
