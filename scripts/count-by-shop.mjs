import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

const { rows } = await pool.query(`
  SELECT shop, COUNT(*)::int AS cnt
  FROM influencers
  GROUP BY shop
  ORDER BY cnt DESC
`);

console.log(JSON.stringify(rows, null, 2));
await pool.end();
