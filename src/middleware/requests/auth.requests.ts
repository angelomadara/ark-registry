import { body, ValidationChain } from "express-validator";

/**
 * Validation rules for `POST /api/v1/auth/register`.
 *
 * Disabled in the router after initial setup — re-enable by uncommenting
 * the `register` route in `routes/auth.routes.ts`.
 */
export const validateRegister: ValidationChain[] = [
    body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

/**
 * Validation rules for `POST /api/v1/auth/login`.
 */
export const validateLogin: ValidationChain[] = [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
];
