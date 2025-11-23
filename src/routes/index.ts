import { Router } from "express";
import authRoutes from "./auth.routes";
import predictionRoutes from "./prediction.routes";
import sensorRoutes from "./sensor.routes";
import plantRoutes from "./plant.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/predict", predictionRoutes);
router.use("/sensor", sensorRoutes);
router.use("/plant", plantRoutes);
router.use("/admin", adminRoutes);

export default router;

