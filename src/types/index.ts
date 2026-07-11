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
