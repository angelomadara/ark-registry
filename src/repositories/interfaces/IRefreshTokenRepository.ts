import { RefreshToken } from "../../models/refresh-token.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IRefreshTokenRepository extends IBaseRepository<RefreshToken> {
    findByTokenHash(hash: string): Promise<RefreshToken | null>;
    revoke(id: number): Promise<void>;
    revokeAllForUser(userId: number): Promise<void>;
}
