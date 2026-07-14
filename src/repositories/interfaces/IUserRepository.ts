import { User } from "../../models/user.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
    findByUsername(username: string): Promise<User | null>;
}
