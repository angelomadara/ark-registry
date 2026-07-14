import { IPaginationOptions } from "../../types";

export interface IBaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
    findAll(options: IPaginationOptions): Promise<{ items: T[]; total: number }>;
    findById(id: string | number): Promise<T | null>;
    create(data: CreateDTO): Promise<T>;
    update(id: string | number, data: UpdateDTO): Promise<T | null>;
    delete(id: string | number): Promise<void>;
}
