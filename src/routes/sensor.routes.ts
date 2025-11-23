import { Router } from "express";
import sensorController from "../controllers/sensor.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authenticate(),
  authorizeRoles(UserRole.AGRICULTURAL_INDUSTRY, UserRole.ADMIN),
  sensorController.record
);

router.get(
  "/history",
  authenticate(),
  authorizeRoles(UserRole.AGRICULTURAL_INDUSTRY, UserRole.ADMIN),
  sensorController.history
);

export default router;

