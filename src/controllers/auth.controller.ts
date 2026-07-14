import { Response } from "express";
import jwt from "jsonwebtoken";
import BaseController from "./base.controller";
import { AuthRequest } from "../middleware/auth.middleware";
import { validateRegister, validateLogin } from "../middleware/validators/auth.validator";
import { AuthService } from "../services/auth.service";
import { ControllerMethod } from "../types";

export class AuthController extends BaseController {
    constructor(private readonly authService: AuthService) {
        super();
    }

    register: ControllerMethod = async (req, res, next) => {
        try {
            const validationErrors = await this.validate(req, validateRegister);
            if (validationErrors) {
                return this.sendValidationError(res, validationErrors);
            }

            const { username, password } = req.body;

            // Check if username already exists
            const existingUser = await this.authService.findByUsername(username);
            if (existingUser) {
                return this.sendBadRequest(res, "Username already exists");
            }

            // Create user
            const user = await this.authService.create(username, password);
            const { password_hash, ...publicUser } = user;
            return this.sendCreated(res, publicUser);
        } catch (error) {
            next(error);
        }
    }

    login: ControllerMethod = async (req, res, next) => {
        try {
            const validationErrors = await this.validate(req, validateLogin);
            if (validationErrors) {
                return this.sendValidationError(res, validationErrors);
            }

            const { username, password } = req.body;

            const user = await this.authService.findByUsername(username);
            if (!user) {
                return this.sendUnauthorized(res, "Invalid username or password");
            }

            const isValid = await this.authService.validatePassword(password, user.password_hash);
            if (!isValid) {
                return this.sendUnauthorized(res, "Invalid username or password");
            }

            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || "fallback-secret", {
                expiresIn: "7d",
            });

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

    me: ControllerMethod = async (req, res, next) => {
        try {
            const authReq = req as AuthRequest;
            const user = await this.authService.findById(authReq.user!.id);
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
