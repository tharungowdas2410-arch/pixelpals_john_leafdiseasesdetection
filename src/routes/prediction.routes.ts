import { Router } from "express";
import predictionController from "../controllers/prediction.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/", authenticate(), upload.single("image"), predictionController.predict);
router.get("/history", authenticate(), predictionController.history);

export default router;

