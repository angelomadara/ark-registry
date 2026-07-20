# Migration Guide

> **Database migration system for The Ark Registry** — Laravel-style `make:migration`, `migrate`, and `migrate:rollback` powered by [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate).

---

## Quick Reference

| Command | What it does | Laravel equivalent |
|---------|-------------|-------------------|
| `npm run make:migration <name>` | Generate a timestamped migration file | `php artisan make:migration` |
| `npm run migrate` | Apply all pending migrations | `php artisan migrate` |
| `npm run migrate:rollback` | Rollback the last migration | `php artisan migrate:rollback --step=1` |
| `npm run migrate:rollback 3` | Rollback the last 3 migrations | `php artisan migrate:rollback --step=3` |
| `npm run migrate:status` | Show which migrations have been applied | `php artisan migrate:status` |

---

## Creating a Migration

### Naming conventions

The generator detects intent from the name and scaffolds the right template:

| Command | Generates |
|---------|-----------|
| `npm run make:migration `**`create_habitats_table`** | `CREATE TABLE habitats (...)` |
| `npm run make:migration `**`add_colour_to_habitats`** | `ALTER TABLE habitats ADD COLUMN colour ...` |
| `npm run make:migration `**`remove_flag_from_sightings`** | `ALTER TABLE sightings DROP COLUMN flag` |
| `npm run make:migration `**`drop_temp_table`** | `DROP TABLE IF EXISTS temp` |
| `npm run make:migration `**`do_something_custom`** | Bare `-- up migration / down` skeleton |

All names are converted to **snake_case** automatically. CamelCase names like `createUsersTable` work too.

### Examples

```bash
# Create a new table
npm run make:migration create_species_habitats

# Add a column to an existing table
npm run make:migration add_iucn_status_to_species

# Remove a column
npm run make:migration remove_deprecated_flag_from_sightings
```

Each creates a file in `migrations/` with a **UTC-timestamped filename**:

```
migrations/20260714171500_create_species_habitats.sql
migrations/20260714171600_add_iucn_status_to_species.sql
```

---

## Anatomy of a Migration File

### CREATE TABLE template

```sql
-- up migration

CREATE TABLE IF NOT EXISTS habitats (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- down migration

DROP TABLE IF EXISTS habitats;
```

### ADD COLUMN template

```sql
-- up migration

ALTER TABLE species
    ADD COLUMN iucn_status VARCHAR(50);

-- down migration

ALTER TABLE species
    DROP COLUMN IF EXISTS iucn_status;
```

### Custom migration (bare template)

```sql
-- up migration

-- TODO: write your migration logic here

-- down migration

-- TODO: write the rollback here
```

**Important:** Always fill in both `-- up migration` and `-- down migration`. The down section is what makes rollback possible.

---

## Applying Migrations

### Apply all pending

```bash
npm run migrate
```

Output:
```
No migrations to run!
```

Or if new migrations were added:
```
Applied up: 20260714171500_create_species_habitats
```

### Auto-migration on startup

Migrations also run **automatically every time the backend server starts**. The `src/index.ts` calls `migrateOnStartup()` after connecting to the database. You'll see this in the logs:

```
Successfully connected to PostgreSQL database
Migrations up to date
```

If another migration process is already running (e.g. you ran `npm run migrate` at the same time as a restart), it logs:

```
Migrations skipped (another process is running them)
```

This is safe — the other process handles the migration.

---

## Rolling Back

### Rollback the last migration

```bash
npm run migrate:rollback
```

### Rollback multiple steps

```bash
npm run migrate:rollback 3
```

This only works if each migration has a complete `-- down migration` section.

---

## Checking Status

```bash
npm run migrate:status
```

Shows which migrations have been applied and which are pending.

---

## How It Works

### Architecture

```
npm run make:migration ───────→ creates .sql file in migrations/
        (runs on host)

npm run migrate ──docker exec──→ inside ark-backend container
                                  │
                                  ├── tsx src/scripts/migrate.ts up
                                  │       │
                                  │       └── node-pg-migrate runner
                                  │               │
                                  │               ├── reads migrations/*.sql
                                  │               ├── checks pgmigrations table
                                  │               └── applies pending ones
                                  │
                                  └── connects to ark-db:5432
                                        (Docker internal network)
```

### Tracking table

`node-pg-migrate` maintains a `pgmigrations` table in the database that records every applied migration:

```
name                               | run_on
-----------------------------------+-------------------------------
001_create_species_tables          | 2026-07-14 07:00:13.060429+00
002_create_species_sightings       | 2026-07-14 07:00:13.060429+00
003_create_users_table             | 2026-07-14 07:00:13.060429+00
005_add_name_date_to_sightings     | 2026-07-14 07:00:13.060429+00
20260714171500_create_habitats     | 2026-07-14 17:15:00.000000+00
```

- Only files **not** in this table are applied.
- The filename (without `.sql`) identifies each migration.
- Files are sorted alphabetically — timestamp prefixes guarantee correct ordering.

---

## Workflow: Adding a New Field

A typical workflow looks like this:

```bash
# 1. Generate the migration file
npm run make:migration add_colour_to_habitats

# 2. Edit the generated file
#    Change VARCHAR(255) to the actual column type you need
#    e.g. colour VARCHAR(100) NOT NULL DEFAULT 'green'

# 3. Apply it
npm run migrate

# 4. Update the TypeScript model (src/models/*.ts)
#    Add the new field to the interface

# 5. Update the validator (src/middleware/validators/*.validator.ts)
#    Add validation rules if the field comes from user input

# 6. Rebuild and restart
docker exec ark-backend npm run build && docker restart ark-backend
```

---

## Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| `getaddrinfo EAI_AGAIN ark-db` | Running `tsx` on host instead of inside Docker | Always use `npm run migrate` (wraps in `docker exec`) |
| `Another migration is already running` | Two concurrent migration processes | Wait for the first to finish, or restart the container |
| `Failed to release migration lock` | Cosmetic — lock wasn't acquired | Safe to ignore |
| Migration file is skipped | Already in `pgmigrations` table | Check `npm run migrate:status` |
| Rollback doesn't work | Missing `-- migrate:down` section | Write the down section before deploying |

---

## Existing Migrations (Backfilled)

These four migrations were applied before `node-pg-migrate` was installed and are recorded as already-run in `pgmigrations`:

| File | Purpose |
|------|---------|
| `001_create_species_tables.sql` | Core species table |
| `002_create_species_sightings.sql` | Sighting records |
| `003_create_users_table.sql` | User accounts |
| `005_add_name_date_to_sightings.sql` | Added name, scientific_name, date_taken to sightings |

They will not re-run. New migrations start after these.
