import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import logger from "../utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]
  });

if (env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

prisma
  .$connect()
  .then(() => logger.info("Prisma connected"))
  .catch((error: unknown) => {
    logger.error("Prisma connection failed", { error });
  });

export default prisma;

