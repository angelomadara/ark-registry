import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { PgUserRepository } from "../repositories";

export class AuthService {

    constructor(private readonly userRepo: PgUserRepository) {}

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
}
