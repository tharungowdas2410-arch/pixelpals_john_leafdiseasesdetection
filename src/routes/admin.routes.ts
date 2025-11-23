import { Router } from "express";
import adminController from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate(), authorizeRoles(UserRole.ADMIN));

router.get("/predictions", adminController.predictions);
router.post("/plant/add", adminController.addPlant);
router.post("/disease", adminController.createDisease);
router.put("/disease/:id", adminController.updateDisease);
router.delete("/disease/:id", adminController.deleteDisease);
router.post("/market-price", adminController.upsertMarketPrice);
router.post("/dataset/upload", require("../middlewares/datasetUpload.middleware").datasetUpload.single("datasetZip"), adminController.uploadDataset);
router.get("/dataset", adminController.listDatasets);
router.get("/dataset/:id", adminController.getDataset);
router.post("/dataset/import-url", adminController.importDatasetUrl);

export default router;

