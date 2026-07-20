import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model";
import { PgUserRepository, PgRefreshTokenRepository } from "../repositories";

export class AuthService {

    constructor(
        private readonly userRepo: PgUserRepository,
        private readonly refreshTokenRepo: PgRefreshTokenRepository,
    ) {}

    async create(username: string, password: string, role: string = "user"): Promise<User> {
        const password_hash = await bcrypt.hash(password, 10);
        return this.userRepo.create({ username, password_hash, role } as any);
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepo.findByUsername(username);
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepo.findById(id);
    }

    async validatePassword(plainPassword: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hash);
    }

    async login(username: string, password: string): Promise<{ user: Omit<User, "password_hash">; accessToken: string; refreshToken: string }> {
        const user = await this.findByUsername(username);
        if (!user) {
            throw new Error("Invalid username or password");
        }

        const isValid = await this.validatePassword(password, user.password_hash);
        if (!isValid) {
            throw new Error("Invalid username or password");
        }

        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user.id);

        const { password_hash, ...publicUser } = user;
        return { user: publicUser, accessToken, refreshToken };
    }

    async refreshAccessToken(refreshTokenStr: string): Promise<{ accessToken: string; refreshToken: string }> {
        const hash = crypto.createHash("sha256").update(refreshTokenStr).digest("hex");
        const storedToken = await this.refreshTokenRepo.findByTokenHash(hash);

        if (!storedToken) {
            throw new Error("Invalid or expired refresh token");
        }

        // Rotate: revoke the old refresh token
        await this.refreshTokenRepo.revoke(storedToken.id);

        // Find the user to generate new tokens
        const user = await this.userRepo.findById(storedToken.user_id);
        if (!user) {
            throw new Error("User not found");
        }

        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user.id);

        return { accessToken, refreshToken };
    }

    async logout(userId: number): Promise<void> {
        await this.refreshTokenRepo.revokeAllForUser(userId);
    }

    private generateAccessToken(user: User): string {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set");
        }
        return jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { algorithm: "HS256", expiresIn: "15m" },
        );
    }

    private async generateRefreshToken(userId: number): Promise<string> {
        const rawToken = crypto.randomBytes(40).toString("hex");
        const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.refreshTokenRepo.create({
            user_id: userId,
            token_hash: hash,
            expires_at: expiresAt,
        } as any);

        return rawToken;
    }
}
