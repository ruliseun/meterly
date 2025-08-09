/* eslint-disable complexity */
import { Request, Response, NextFunction } from "express";
import JwtService from "../service/jwt.service";
import ABSTRACT_SERVICE from "../service/abstractService/abstractService";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/Token";
import { IUser } from "../interface/user.interface";
import { AppDataSource } from "../data-source";
import { UserStatusEnum } from "../enums/user-type.enum";
import Logger from "../utils/logger";

export function authGuard() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token;

      if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        token = req.cookies?.accessToken;
      }

      const decodeToken = await JwtService.verifyToken(token);

      if (!decodeToken) {
        return res.status(401).json({ error: true, message: "Invalid Token!", status: "4012" });
      }

      const { sub, dType } = decodeToken;

      const tokenAlive = await ABSTRACT_SERVICE.getUniqueData(RefreshToken, { user: sub, platform: dType });

      if (tokenAlive && tokenAlive.is_revoked) {
        return res.status(401).json({ error: true, message: "Unauthorized Access", status: "4014" });
      }

      const userRepository = AppDataSource.getRepository(User);

      const getUser = await userRepository.findOne({
        where: { id: sub },
        relations: ["electricityMeters"],
      });

      if (!getUser || getUser.status !== UserStatusEnum.ACTIVE) {
        return res.status(401).json({ error: true, message: "Unauthorized user", status: "403" });
      }

      (req as any).user = sub;
      (req as any).profile = getUser as unknown as Partial<IUser>;

      return next();
    } catch (error) {
      Logger.error("Error in authGuard middleware:", error);
      return res.status(error.httpStatusCode || 500).json({
        error: true,
        status: error.httpStatusCode || "500",
        message: error.message || "Failed Processing Request. Try again.",
      });
    }
  };
}
