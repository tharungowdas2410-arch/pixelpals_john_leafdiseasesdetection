import { sign, verify, Secret, JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "@prisma/client";

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export const signAccessToken = (payload: TokenPayload) => {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any };
  return sign(payload, env.JWT_ACCESS_SECRET as Secret, options);
};

export const signRefreshToken = (payload: TokenPayload) => {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
  return sign(payload, env.JWT_REFRESH_SECRET as Secret, options);
};

export const verifyAccessToken = (token: string) =>
  verify(token, env.JWT_ACCESS_SECRET as Secret) as TokenPayload & JwtPayload;

export const verifyRefreshToken = (token: string) =>
  verify(token, env.JWT_REFRESH_SECRET as Secret) as TokenPayload & JwtPayload;

