import { Response, NextFunction } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import BaseController from "./base.controller";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

const authService = new AuthService();

class AuthController extends BaseController {
    async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const validationErrors = await this.validate(req, [
                body("username").notEmpty().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
                body("password").notEmpty().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
            ]);
            if (validationErrors) {
                return this.sendValidationError(res, validationErrors);
            }

            const { username, password } = req.body;

            // Check if username already exists
            const existingUser = await authService.findByUsername(username);
            if (existingUser) {
                return this.sendBadRequest(res, "Username already exists");
            }

            // Create user
            const user = await authService.create(username, password);
            const { password_hash, ...publicUser } = user;
            return this.sendCreated(res, publicUser);
        } catch (error) {
            next(error);
        }
    }

    async login(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return this.sendBadRequest(
                    res,
                    "Username and password are required",
                );
            }

            const user = await authService.findByUsername(username);
            if (!user) {
                return this.sendUnauthorized(
                    res,
                    "Invalid username or password",
                );
            }

            const isValid = await authService.validatePassword(
                password,
                user.password_hash,
            );
            if (!isValid) {
                return this.sendUnauthorized(
                    res,
                    "Invalid username or password",
                );
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || "fallback-secret",
                { expiresIn: "7d" },
            );

            return this.sendSuccess(res, {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.findById(req.user!.id);
            if (!user) {
                return this.sendNotFound(res, "User not found");
            }
            const { password_hash, ...publicUser } = user;
            return this.sendSuccess(res, publicUser);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
