import { Response } from "express";
import BaseController from "./base.controller";
import { AuthRequest } from "../middleware/auth.middleware";
import { validateRegister, validateLogin, validateRefresh } from "../middleware/validators/auth.validator";
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

            const result = await this.authService.login(username, password);

            return this.sendSuccess(res, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user,
            });
        } catch (error) {
            next(error);
        }
    }

    refresh: ControllerMethod = async (req, res, next) => {
        try {
            const validationErrors = await this.validate(req, validateRefresh);
            if (validationErrors) {
                return this.sendValidationError(res, validationErrors);
            }

            const { refreshToken } = req.body;
            const tokens = await this.authService.refreshAccessToken(refreshToken);

            return this.sendSuccess(res, tokens);
        } catch (error) {
            next(error);
        }
    }

    logout: ControllerMethod = async (req, res, next) => {
        try {
            const authReq = req as AuthRequest;
            if (!authReq.user) {
                return this.sendUnauthorized(res, "Authentication required");
            }

            await this.authService.logout(authReq.user.id);

            return this.sendSuccess(res, null, "Logged out successfully");
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
