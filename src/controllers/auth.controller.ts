import { Request, Response } from "express";
import authService from "../services/auth.service";
import { env } from "../config/env";

const googleCallback = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Google authentication failed" });
  }

  const u = req.user as { id: string; email: string; role: any };
  const tokens = await authService.generateTokens({
    id: u.id,
    email: u.email,
    role: u.role
  });

  const redirectUrl = new URL("/oauth/callback", env.FRONTEND_URL);
  redirectUrl.searchParams.set("accessToken", tokens.accessToken);
  redirectUrl.searchParams.set("refreshToken", tokens.refreshToken);
  return res.redirect(redirectUrl.toString());
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const tokens = await authService.refreshTokens(refreshToken);
    return res.json(tokens);
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logout = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const u = req.user as { id: string };
  await authService.logout(u.id);
  return res.json({ message: "Logged out" });
};

const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.json(req.user);
};

const manualLogin = async (req: Request, res: Response) => {
  const { email, name, role } = req.body;
  const user = await authService.manualLogin({ email, name, role });
  const tokens = await authService.generateTokens({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    tokens
  });
};

export default {
  googleCallback,
  refreshToken,
  logout,
  me,
  manualLogin
};

