import http from "http";
import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./utils/socket";
import logger from "./utils/logger";

const server = http.createServer(app);

initSocket(server);

server.listen(env.PORT, env.HOST, () => {
  logger.info(`Server listening on http://${env.HOST}:${env.PORT}`);
});

