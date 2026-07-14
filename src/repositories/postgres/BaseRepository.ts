import { IPaginationOptions } from "../../types";
import { IBaseRepository } from "../interfaces/IBaseRepository";
import { query } from "../../config/database";

export abstract class PgBaseRepository<T extends { id: number }, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>
    implements IBaseRepository<T, CreateDTO, UpdateDTO>
{
    constructor(
        protected readonly tableName: string,
        protected readonly idColumn: string = "id",
    ) {}

    async findAll(options: IPaginationOptions): Promise<{ items: T[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        const rows = await query(
            `SELECT * FROM "${this.tableName}" ORDER BY "${this.idColumn}" DESC LIMIT $1 OFFSET $2`,
            [String(limit), String(offset)],
        );

        const countResult = await query(
            `SELECT COUNT(*) AS total FROM "${this.tableName}"`,
        );

        return {
            items: rows.rows as unknown as T[],
            total: parseInt(countResult.rows[0]?.total ?? "0", 10),
        };
    }

    async findById(id: string | number): Promise<T | null> {
        const result = await query(
            `SELECT * FROM "${this.tableName}" WHERE "${this.idColumn}" = $1`,
            [id],
        );
        return (result.rows[0] as unknown as T) ?? null;
    }

    async create(data: CreateDTO): Promise<T> {
        const keys = Object.keys(data as object);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        const columns = keys.map((k) => `"${k}"`).join(", ");
        const values = Object.values(data as object);

        const result = await query(
            `INSERT INTO "${this.tableName}" (${columns}) VALUES (${placeholders}) RETURNING *`,
            values,
        );

        return result.rows[0] as T;
    }

    async update(id: string | number, data: UpdateDTO): Promise<T | null> {
        const keys = Object.keys(data as object);
        if (keys.length === 0) return this.findById(id);

        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
        const values = Object.values(data as object);

        await query(
            `UPDATE "${this.tableName}" SET ${setClause} WHERE "${this.idColumn}" = $${keys.length + 1}`,
            [...values, id],
        );

        return this.findById(id);
    }

    async delete(id: string | number): Promise<void> {
        await query(
            `DELETE FROM "${this.tableName}" WHERE "${this.idColumn}" = $1`,
            [id],
        );
    }
}
