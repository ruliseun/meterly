import jwt, { SignOptions, TokenExpiredError } from "jsonwebtoken";
import { TOKENS } from "../config/env";

const baseOptions: SignOptions = {
  issuer: "localhost:3012",
};

const generateToken = async ({
  sub,
  jwtid,
  expiresIn = null,
  deviceType,
}: {
  sub: any;
  jwtid?: string;
  expiresIn?: any;
  deviceType: string;
}) => {
  const token = jwt.sign(
    {
      sub,
      jwtid,
      deviceType,
    },
    TOKENS.auth_token_secret!,
    expiresIn ? { expiresIn, ...baseOptions } : { ...baseOptions },
  );

  return token;
};

const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, TOKENS.auth_token_secret!, baseOptions as any);
    return decoded as any;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      const error = new Error("Token Expired!");
      (error as any).httpStatusCode = 400;
      throw error;
    }
    const newError = new Error("Access denied!");
    (newError as any).httpStatusCode = 400;
    throw newError;
  }
};

const JwtService = {
  generateToken,
  verifyToken,
};

export default JwtService;
