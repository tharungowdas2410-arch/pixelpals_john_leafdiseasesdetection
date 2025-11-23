import { Router } from "express";
import passport from "passport";
import authController from "../controllers/auth.controller";
import { authLimiter } from "../middlewares/rateLimiter";
import { authenticate } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validateRequest";
import { manualLoginSchema } from "../validators/auth.schema";

const router = Router();

router.get("/google", authLimiter, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);

router.post("/refresh", authController.refreshToken);
router.post("/logout", authenticate(), authController.logout);
router.get("/me", authenticate(), authController.me);
router.post("/manual", validateBody(manualLoginSchema), authController.manualLogin);

export default router;

