import prisma from "../config/database";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { UserRole } from "@prisma/client";

interface OAuthPayload {
  providerId: string;
  email: string;
  name: string;
}

const handleOAuthLogin = async ({ providerId, email, name }: OAuthPayload) => {
  const roleSeed = await prisma.role.findUnique({ where: { name: UserRole.FARMER } });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      googleId: providerId,
      name,
      role: roleSeed ? roleSeed.name : UserRole.FARMER
    },
    create: {
      email,
      name,
      googleId: providerId,
      role: roleSeed ? roleSeed.name : UserRole.FARMER
    }
  });

  return user;
};

const generateTokens = async (user: { id: string; email: string; role: UserRole }) => {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });

  return { accessToken, refreshToken };
};

const refreshTokens = async (token: string) => {
  const decoded = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || user.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  return generateTokens({ id: user.id, email: user.email, role: user.role });
};

const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }
  });
};

const manualLogin = async (input: { email: string; name?: string; role: UserRole }) => {
  const normalizedRole = input.role ?? UserRole.FARMER;
  const displayName = input.name ?? input.email.split("@")[0];

  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: displayName,
      role: normalizedRole
    },
    create: {
      email: input.email,
      name: displayName,
      role: normalizedRole
    }
  });

  return user;
};

export default {
  handleOAuthLogin,
  generateTokens,
  refreshTokens,
  logout,
  manualLogin
};

