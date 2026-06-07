import { Request, Response, NextFunction } from "express";

export interface IApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    errors?: any[];
}
