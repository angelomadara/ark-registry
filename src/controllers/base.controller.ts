import { Request, Response, RequestHandler } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { IApiResponse } from "../types/index";

/**
 * Base Controller
 * Abstract class providing common functionality for all controllers
 * Similar to Laravel's base Controller class
 */
abstract class BaseController {
    /**
     * Registered middleware for this controller
     */
    protected middlewares: RequestHandler[] = [];

    /**
     * Register middleware for this controller
     * Similar to Laravel's middleware() method
     *
     * @param middleware - Middleware function(s) to register
     */
    protected middleware(...middleware: RequestHandler[]): void {
        this.middlewares.push(...middleware);
    }

    /**
     * Get all registered middleware
     */
    public getMiddlewares(): RequestHandler[] {
        return this.middlewares;
    }

    /**
     * Validate request using express-validator
     * Similar to Laravel's validate() method
     *
     * @param req - Express request object
     * @param validations - Array of validation chains
     * @returns Validation errors or null if valid
     */
    protected async validate(
        req: Request,
        validations: ValidationChain[],
    ): Promise<any[] | null> {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));

        // Check for errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errors.array();
        }

        return null;
    }

    /**
     * Check authorization
     * Similar to Laravel's authorize() method
     *
     * @param condition - Authorization condition
     * @param message - Error message if unauthorized
     * @throws Error if unauthorized
     */
    protected authorize(
        condition: boolean,
        message: string = "Unauthorized",
    ): void {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * Paginate data
     * Similar to Laravel's pagination
     *
     * @param data - Data array to paginate
     * @param page - Current page number
     * @param perPage - Items per page
     * @param total - Total items (optional, if provided we assume data is already sliced)
     * @returns Paginated data with metadata
     */
    // protected paginate<T>(
    //   data: T[],
    //   page: number = 1,
    //   perPage: number = 15,
    //   total?: number,
    // ): {
    //   docs: T[];
    //   meta: {
    //     currentPage: number;
    //     perPage: number;
    //     total: number;
    //     lastPage: number;
    //     from: number;
    //     to: number;
    //   };
    // } {
    //   const actualTotal = total ?? data.length;
    //   const lastPage = Math.ceil(actualTotal / perPage);
    //   const from = (page - 1) * perPage;
    //   const to = Math.min(from + perPage, actualTotal);

    //   // If total is provided, we assume data is already sliced by the service
    //   const paginatedData = total !== undefined ? data : data.slice(from, to);

    //   return {
    //     docs: paginatedData,
    //     meta: {
    //       currentPage: page,
    //       perPage,
    //       total: actualTotal,
    //       lastPage,
    //       from: from + 1,
    //       to,
    //     },
    //   };
    // }

    // ==================== Response Methods ====================

    /**
     * Send success response (200)
     */
    protected sendSuccess<T>(
        res: Response,
        data: T,
        message: string = "Success",
        statusCode: number = 200,
    ): Response {
        const response: IApiResponse<T> = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Send created response (201)
     */
    protected sendCreated<T>(
        res: Response,
        data: T,
        message: string = "Created successfully",
    ): Response {
        return this.sendSuccess(res, data, message, 201);
    }

    /**
     * Send no content response (204)
     */
    protected sendNoContent(res: Response): Response {
        return res.status(204).send();
    }

    /**
     * Send error response
     */
    protected sendError(
        res: Response,
        message: string,
        statusCode: number = 500,
        errors?: any[],
    ): Response {
        const response: IApiResponse = {
            success: false,
            message,
            ...(errors && { errors }),
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Send bad request response (400)
     */
    protected sendBadRequest(
        res: Response,
        message: string = "Bad request",
        errors?: any[],
    ): Response {
        return this.sendError(res, message, 400, errors);
    }

    /**
     * Send unauthorized response (401)
     */
    protected sendUnauthorized(
        res: Response,
        message: string = "Unauthorized",
    ): Response {
        return this.sendError(res, message, 401);
    }

    /**
     * Send forbidden response (403)
     */
    protected sendForbidden(
        res: Response,
        message: string = "Forbidden",
    ): Response {
        return this.sendError(res, message, 403);
    }

    /**
     * Send not found response (404)
     */
    protected sendNotFound(
        res: Response,
        message: string = "Resource not found",
    ): Response {
        return this.sendError(res, message, 404);
    }

    /**
     * Send validation error response (422)
     */
    protected sendValidationError(
        res: Response,
        errors: any[],
        message: string = "Validation failed",
    ): Response {
        return this.sendError(res, message, 422, errors);
    }

    /**
     * Send server error response (500)
     */
    protected sendServerError(
        res: Response,
        message: string = "Internal server error",
    ): Response {
        return this.sendError(res, message, 500);
    }
}

export default BaseController;
