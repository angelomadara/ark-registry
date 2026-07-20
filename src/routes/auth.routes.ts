import { Router } from "express";
// import AuthController from "../controllers/auth.controller";
import { authController } from "../composition-root";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Registration is disabled after initial setup
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
