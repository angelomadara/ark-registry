export interface RefreshToken {
    id: number;
    user_id: number;
    token_hash: string;
    expires_at: Date;
    created_at: Date;
    revoked_at: Date | null;
}
