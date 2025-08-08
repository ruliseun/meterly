import { JwtPayload } from "jsonwebtoken";
import { TOKENS } from "../config/env";
import JwtService from "./jwt.service";
import { IUser } from "../interface/user.interface";
import ABSTRACT_SERVICE from "./abstractService/abstractService";
import { RefreshToken } from "../entity/Token";
import { MoreThanOrEqual } from "typeorm";
import { DeviceTypeEnum } from "../enums/user-type.enum";
import { User } from "../entity/User";
import { REFRESH_TOKEN_MODEL } from "../config/database/db";

const generateRefreshToken = async (user: Partial<IUser>, userAgent: string, deviceType: string) => {
  const expiresIn = deviceType === DeviceTypeEnum.WEB ? +TOKENS.refresh_token_expiry! : null;
  const expires = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

  let refreshTokenExists = await ABSTRACT_SERVICE.getUniqueData(RefreshToken, {
    user: user.id,
    platform: deviceType,
  });

  let tokenId;

  if (refreshTokenExists) {
    const tokenUpdate: any = {
      ...refreshTokenExists,
      user_agent: userAgent,
      expires,
    };
    await REFRESH_TOKEN_MODEL.save(tokenUpdate);
    tokenId = refreshTokenExists?.id;
  } else {
    const createTokenRecorod = await ABSTRACT_SERVICE.createData(RefreshToken, {
      user: user,
      user_agent: userAgent,
      platform: deviceType,
      expires,
    });
    tokenId = createTokenRecorod.id;
  }

  const payload = {
    sub: user.id,
    jwtid: tokenId,
    expiresIn: expiresIn ? expiresIn : undefined,
    deviceType,
  };

  return await JwtService.generateToken(payload);
};

const decodeRefreshToken = async (refreshToken: string) => {
  return await JwtService.verifyToken(refreshToken);
};

const generateAccessToken = async (sub: Partial<IUser>, jwtid: string, deviceType: string) => {
  let expiresIn: number | null = null;

  if (deviceType === DeviceTypeEnum.WEB) {
    expiresIn = +TOKENS.access_token_expiry!;
  } else if (deviceType === DeviceTypeEnum.APP) {
    expiresIn = null;
  }

  const payload = {
    sub: sub.id,
    jwtid,
    expiresIn: expiresIn || undefined,
    deviceType,
  };

  const accessToken = await JwtService.generateToken(payload);

  return { accessToken, expiresIn: expiresIn ? expiresIn * 1000 : null };
};

const generateAccessTokenFromRefreshToken = async (refreshToken: string, deviceType: string) => {
  const data = (await decodeRefreshToken(refreshToken)) as JwtPayload;

  if (!data) throw new Error();

  const { sub, jwtid } = data;

  const tokenDocument = await getStoredValidRefreshToken(jwtid);

  if (!tokenDocument) {
    throw new Error("Invalid Token");
  }

  const getProfile = (await ABSTRACT_SERVICE.getUniqueData(User, { id: sub })) as unknown as IUser;

  if (getProfile.id && jwtid) {
    return await generateAccessToken(getProfile, jwtid, deviceType);
  }

  return { error: true, message: "Invalid sub or jwtid" };
};

const getStoredValidRefreshToken = async (id: number) => {
  return await ABSTRACT_SERVICE.getUniqueData(RefreshToken, {
    id: id,
    is_revoked: false,
    expires: MoreThanOrEqual(new Date()),
  });
};

const deleteRefreshToken = async (user: string, deviceType: string) => {
  await ABSTRACT_SERVICE.updateByEntry(RefreshToken, { user: user }, { is_revoked: true });
  return await ABSTRACT_SERVICE.removeData(RefreshToken, { user: user, platform: deviceType });
};

const TokenService = {
  generateRefreshToken,
  decodeRefreshToken,
  generateAccessToken,
  generateAccessTokenFromRefreshToken,
  deleteRefreshToken,
};

export default TokenService;
