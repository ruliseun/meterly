import { NextFunction, Request, Response } from "express";
import { API_KEY } from "./env";

export const validateKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  const appKey = API_KEY;

  if (!apiKey || apiKey !== appKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};
