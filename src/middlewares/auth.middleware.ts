import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import prisma from "../config/database";

export const authenticate =
  (allowOptional = false) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        if (allowOptional) {
          return next();
        }
        return res.status(401).json({ message: "Authorization header missing" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        if (allowOptional) {
          return next();
        }
        return res.status(401).json({ message: "Token missing" });
      }

      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      return next();
    } catch (error) {
      if (allowOptional) {
        return next();
      }
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };

