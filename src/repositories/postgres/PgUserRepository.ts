import { User } from "../../models/user.model";
import { PgBaseRepository } from "./BaseRepository";
import { IUserRepository } from "../interfaces/IUserRepository";
import { query } from "../../config/database";

export class PgUserRepository
    extends PgBaseRepository<User>
    implements IUserRepository
{
    constructor() {
        super("users");
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await query(
            'SELECT * FROM "users" WHERE "username" = $1 AND "deleted_at" IS NULL',
            [username],
        );
        return result.rows[0] ?? null;
    }
}

export default PgUserRepository;
