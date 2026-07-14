import { NextFunction, Request, Response } from "express";

export type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<void | Response> | void | Response;

export interface IPaginationOptions {
    page: number;
    limit: number;
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown[];
}
