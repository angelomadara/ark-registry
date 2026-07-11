import bcrypt from "bcryptjs";
import { query } from "../config/database";
import { User } from "../models/user.model";

export class AuthService {
    async create(
        username: string,
        password: string,
        role: string = "user",
    ): Promise<User> {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await query(
            `INSERT INTO users (username, password_hash, role)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [username, password_hash, role],
        );
        return result.rows[0];
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await query(
            "SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL",
            [username],
        );
        return result.rows[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const result = await query(
            "SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL",
            [id],
        );
        return result.rows[0] || null;
    }

    async validatePassword(
        plainPassword: string,
        hash: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hash);
    }
}
