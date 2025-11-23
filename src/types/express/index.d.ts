import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    }

    interface Request {
      user?: User;
      tokens?: {
        accessToken: string;
        refreshToken: string;
      };
    }
  }
}

export {};

