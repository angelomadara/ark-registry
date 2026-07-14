export interface User {
    id: number;
    username: string;
    password_hash: string;
    role: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface UserPublic {
    id: number;
    username: string;
    role: string;
    created_at: Date;
}
