import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Registration is disabled after initial setup
// router.post("/register", AuthController.register.bind(AuthController));
router.post("/login", AuthController.login.bind(AuthController));
router.get(
    "/me",
    authenticate,
    AuthController.me.bind(AuthController),
);

export default router;
