import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env";
import logger from "./logger";

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected ${socket.id}`);
    });
  });

  logger.info(`Socket.IO initialized in ${env.NODE_ENV} mode`);
  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};

