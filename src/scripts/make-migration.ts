#!/usr/bin/env tsx
/**
 * make:migration — Laravel-style migration generator
 *
 * Detects intent from the migration name:
 *   create_xxx_table       → CREATE TABLE template
 *   add_xxx_to_yyy         → ALTER TABLE ... ADD COLUMN template
 *   remove_xxx_from_yyy    → ALTER TABLE ... DROP COLUMN template
 *   drop_xxx_table         → DROP TABLE template
 *   default                → bare -- up migration / -- down migration
 *
 * Usage:
 *   npm run make:migration create_habitats_table
 *   npm run make:migration add_colour_to_habitats
 *   npm run make:migration remove_colour_from_habitats
 */

import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.resolve(__dirname, "../../migrations");

function pad(n: number, len: number = 2): string {
  return n.toString().padStart(len, "0");
}

function timestamp(): string {
  const d = new Date();
  return (
    `${d.getUTCFullYear()}` +
    `${pad(d.getUTCMonth() + 1)}` +
    `${pad(d.getUTCDate())}` +
    `${pad(d.getUTCHours())}` +
    `${pad(d.getUTCMinutes())}` +
    `${pad(d.getUTCSeconds())}` +
    `${pad(d.getUTCMilliseconds(), 3)}`
  );
}

function snakeCase(name: string): string {
  return name
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/[^a-z0-9_]+/g, "_");
}

function detectType(
  name: string,
): { type: string; table: string; column?: string } {
  const slug = snakeCase(name);

  const createMatch = slug.match(/^create_(.+?)(?:_table)?$/);
  if (createMatch) return { type: "create", table: createMatch[1] };

  const addMatch = slug.match(/^add_(.+?)_to_(.+?)$/);
  if (addMatch) return { type: "add", column: addMatch[1], table: addMatch[2] };

  const removeMatch = slug.match(/^remove_(.+?)_from_(.+?)$/);
  if (removeMatch)
    return { type: "remove", column: removeMatch[1], table: removeMatch[2] };

  const dropMatch = slug.match(/^drop_(.+?)(?:_table)?$/);
  if (dropMatch) return { type: "drop", table: dropMatch[1] };

  return { type: "bare", table: slug };
}

function buildTemplate(name: string): string {
  const { type, table, column } = detectType(name);
  const tableName = table || "new_table";

  switch (type) {
    case "create":
      return `-- up migration

CREATE TABLE IF NOT EXISTS ${tableName} (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- down migration

DROP TABLE IF EXISTS ${tableName};`;

    case "add":
      return `-- up migration

ALTER TABLE ${table}
    ADD COLUMN ${column} VARCHAR(255);

-- down migration

ALTER TABLE ${table}
    DROP COLUMN IF EXISTS ${column};`;

    case "remove":
      return `-- up migration

ALTER TABLE ${table}
    DROP COLUMN IF EXISTS ${column};

-- down migration

ALTER TABLE ${table}
    ADD COLUMN ${column} VARCHAR(255);`;

    case "drop":
      return `-- up migration

DROP TABLE IF EXISTS ${tableName};

-- down migration

CREATE TABLE IF NOT EXISTS ${tableName} (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

    default:
      return `-- up migration

-- TODO: write your migration logic here

-- down migration

-- TODO: write the rollback here`;
  }
}

function main() {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: npm run make:migration <name>");
    console.error("");
    console.error("  Examples:");
    console.error("    npm run make:migration create_habitats_table");
    console.error("    npm run make:migration add_colour_to_habitats");
    console.error("    npm run make:migration remove_colour_from_habitats");
    console.error("    npm run make:migration drop_obsolete_table");
    process.exit(1);
  }

  const ts = timestamp();
  const slug = snakeCase(name);
  const filename = `${ts}_${slug}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const template = buildTemplate(name);

  fs.writeFileSync(filepath, template, "utf-8");
  console.log(`✓ Created migration: ${filename}`);

  const { type, table, column } = detectType(name);
  const hint =
    type === "add"
      ? `  Hint: edit the column type in "ADD COLUMN ${column}"`
      : type === "create"
        ? `  Hint: add columns to the CREATE TABLE block`
        : "";
  if (hint) console.log(hint);
  console.log(`  ${filepath}`);
}

main();
