import { RefreshToken } from "../../models/refresh-token.model";
import { PgBaseRepository } from "./BaseRepository";
import { IRefreshTokenRepository } from "../interfaces/IRefreshTokenRepository";
import { query } from "../../config/database";

export class PgRefreshTokenRepository
    extends PgBaseRepository<RefreshToken>
    implements IRefreshTokenRepository
{
    constructor() {
        super("refresh_tokens");
    }

    async findByTokenHash(hash: string): Promise<RefreshToken | null> {
        const result = await query(
            `SELECT * FROM "refresh_tokens" WHERE "token_hash" = $1 AND "revoked_at" IS NULL AND "expires_at" > NOW()`,
            [hash],
        );
        return result.rows[0] ?? null;
    }

    async revoke(id: number): Promise<void> {
        await query(
            `UPDATE "refresh_tokens" SET "revoked_at" = NOW() WHERE "id" = $1`,
            [id],
        );
    }

    async revokeAllForUser(userId: number): Promise<void> {
        await query(
            `UPDATE "refresh_tokens" SET "revoked_at" = NOW() WHERE "user_id" = $1 AND "revoked_at" IS NULL`,
            [userId],
        );
    }
}

export default PgRefreshTokenRepository;
