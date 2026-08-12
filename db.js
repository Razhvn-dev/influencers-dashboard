require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
});

async function testConnection() {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    console.log('Database connected successfully');
    return true;
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };

if (require.main === module) {
  testConnection()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Database connection failed:', err.message);
      await pool.end();
      process.exit(1);
    });
}
