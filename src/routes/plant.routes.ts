import { Router } from "express";
import plantController from "../controllers/plant.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", authenticate(true), plantController.listPlants);
router.get("/:species", authenticate(true), plantController.getPlant);
router.post(
  "/",
  authenticate(),
  authorizeRoles(UserRole.ADMIN),
  plantController.addPlant
);

export default router;

