import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
});

const files = [
  "init.sql",
  "migrations/001_add_shop_column.sql",
  "migrations/002_add_platform_links.sql",
  "migrations/003_sponsorship_tracking_schema.sql",
  "migrations/004_add_followers_verification.sql",
  "migrations/005_add_creator_profile_fields.sql",
  "migrations/006_add_creator_identity_fields.sql",
];

for (const file of files) {
  const sqlPath = path.resolve(import.meta.dirname, "..", file);
  if (!fs.existsSync(sqlPath)) {
    console.log(`skip missing: ${file}`);
    continue;
  }
  const sql = fs.readFileSync(sqlPath, "utf8");
  console.log(`running ${file}...`);
  await pool.query(sql);
  console.log(`done ${file}`);
}

const { rows } = await pool.query(
  "SELECT COUNT(*)::int AS count FROM influencers",
);
console.log(`influencers rows: ${rows[0].count}`);
await pool.end();
