import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const DIRECTION = process.argv[2] as "up" | "down" | undefined;
const COUNT = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;

async function main() {
  // Construct connection string from env vars (loaded from .env via dotenv)
  const dbUrl =
    `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();

  try {
    const direction = DIRECTION || "up";
    // Dynamic import because node-pg-migrate v8 is ESM-only
    const { runner } = await import("node-pg-migrate");
    const result = await runner({
      dbClient: client,
      direction,
      count: direction === "down" ? COUNT ?? 1 : COUNT ?? Infinity,
      dir: "migrations",
      migrationsTable: "pgmigrations",
      ignorePattern: "(\\..*)|(.*\\.md)$",
    });

    const ran = Array.isArray(result) ? result : [];
    if (ran.length === 0) {
      console.log(`No migrations to ${direction}.`);
    } else {
      console.log(`Applied ${direction}: ${ran.map((m) => m.name).join(", ")}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Called on server startup to auto-apply pending migrations.
 * Uses the existing pool connection (no need to create a new one).
 */
export async function migrateOnStartup(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    const { runner } = await import("node-pg-migrate");
    const result = await runner({
      dbClient: client,
      direction: "up",
      count: Infinity,
      dir: "migrations",
      migrationsTable: "pgmigrations",
      ignorePattern: "(\\..*)|(.*\\.md)$",
    });
    const ran = Array.isArray(result) ? result : [];
    if (ran.length > 0) {
      console.log(`Auto-applied migrations: ${ran.map((m) => m.name).join(", ")}`);
    }
  } catch (err: any) {
    // Gracefully skip if another process holds the migration lock
    if (
      err?.message?.includes("Another migration is already running") ||
      err?.message?.includes("lock")
    ) {
      console.log("Migrations skipped (another process is running them)");
    } else {
      throw err;
    }
  } finally {
    client.release();
  }
}

// Run as a CLI script when executed directly
main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
