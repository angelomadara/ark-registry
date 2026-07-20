import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Only override with .env.local when running outside Docker (local dev)
// Inside Docker, the compose file sets the correct DB_HOST/DB_PORT
const isDocker = fs.existsSync("/.dockerenv");
if (!isDocker) {
    dotenv.config({ path: ".env.local", override: true });
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
});

export const query = (text: string, values?: any[]) => pool.query(text, values);

export default pool;
