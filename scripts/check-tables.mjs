import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  password: "k7jr4m8m",
  host: "dbconn.sealosbja.site",
  port: 41192,
  database: "postgres",
});

const { rows } = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1",
);
console.log(rows.map((r) => r.table_name).join(", ") || "(empty)");
await pool.end();
