import { Router } from "express";
import authController from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import authValidators from "../validations/auth.js";
import { rateLimiter } from "../middleware/rateLimit.js";

const router = Router();

// Public routes
router.post(
  "/login",
  rateLimiter,
  authValidators.validateLogin,
  authController.login
);
router.post(
  "/register",
  authValidators.validateRegister,
  authController.register
);

// Protected routes
router.post("/logout", authenticateToken, authController.logout);
router.get("/profile", authenticateToken, authController.profile);
router.post("/refresh", authenticateToken, authController.refresh);

export default router;
