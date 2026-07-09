#!/usr/bin/env node
// Applies supabase/migrations/*.sql directly via a plain Postgres connection
// (the `pg` package), using SUPABASE_DB_URL from apps/api/.env. No CLI, no
// login, no system packages — just Node. Safe to run repeatedly: it's a
// no-op if the schema is already applied.
//
// SUPABASE_DB_URL: the "Transaction pooler" connection string from
//   Project Settings > Database > Connection string, with your DB password
//   filled in, e.g.
//   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(rootDir, "apps/api/.env");

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function loadEnvFile(path) {
  const env = {};
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

if (!existsSync(envPath)) {
  fail(`${envPath} not found. Run: cp apps/api/.env.example apps/api/.env, fill in SUPABASE_DB_URL, then retry.`);
}

const env = loadEnvFile(envPath);
const dbUrl = env.SUPABASE_DB_URL;
if (!dbUrl) {
  fail(
    `SUPABASE_DB_URL is not set in ${envPath}.\n\n` +
      "Get it from Project Settings > Database > Connection string (Transaction\n" +
      "pooler), fill in your database password, and add it as SUPABASE_DB_URL.",
  );
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

console.log("==> Connecting to database...");
try {
  await client.connect();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  fail(`could not connect using SUPABASE_DB_URL. Check the connection string and password in ${envPath}.`);
}

try {
  const { rows } = await client.query("select to_regclass('public.projects') is not null as exists");
  if (rows[0].exists) {
    console.log("==> Schema already applied — nothing to do.");
    process.exit(0);
  }

  const migrationsDir = join(rootDir, "supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log("==> Applying supabase/migrations/*.sql...");
  for (const file of files) {
    console.log(`  -> ${file}`);
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await client.query(sql);
  }

  console.log("==> Done — schema applied.");
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  fail("failed to apply schema.");
} finally {
  await client.end();
}
