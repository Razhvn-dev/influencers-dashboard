import 'dotenv/config';
import { performance } from 'node:perf_hooks';
import pg from 'pg';

const SHOP = process.env.LOCAL_DEV_SHOP || 'huang-mvqquz1p.myshopify.com';
const BASE = process.env.BENCHMARK_BASE || process.env.BASE_URL || 'http://localhost:3000';
const RUNS = Number(process.env.BENCHMARK_RUNS || 3);

async function timed(label, fn) {
  const start = performance.now();
  const result = await fn();
  const ms = Math.round(performance.now() - start);
  return { label, ms, result };
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: response.status, data };
}

async function benchmarkHttp() {
  const list = await fetchJson('/api/influencers');
  const recordId = list.data?.data?.[0]?.id;
  const endpoints = [
    ['GET /health', () => fetchJson('/health')],
    ['GET /api/influencers/stats/summary', () => fetchJson('/api/influencers/stats/summary')],
    ['GET /api/influencers', () => fetchJson('/api/influencers')],
    ...(recordId ? [[`GET /api/influencers/${recordId}`, () => fetchJson(`/api/influencers/${recordId}`)]] : []),
  ];

  const summary = [];

  for (const [label, fn] of endpoints) {
    const samples = [];
    for (let i = 0; i < RUNS; i += 1) {
      const { ms, result } = await timed(label, fn);
      samples.push({ ms, status: result.status, ok: result.status >= 200 && result.status < 300 });
    }
    const avg = Math.round(samples.reduce((sum, s) => sum + s.ms, 0) / samples.length);
    const min = Math.min(...samples.map((s) => s.ms));
    const max = Math.max(...samples.map((s) => s.ms));
    summary.push({ label, avg, min, max, status: samples.at(-1).status, ok: samples.every((s) => s.ok) });
  }

  return summary;
}

async function benchmarkDb() {
  const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: false,
  });

  const queries = [
    ['COUNT influencers', 'SELECT COUNT(*)::INT AS count FROM influencers WHERE shop = $1', [SHOP]],
    [
      'LIST influencers',
      `SELECT id, name, status, total_followers, next_followup_at
       FROM influencers WHERE shop = $1 ORDER BY id DESC`,
      [SHOP],
    ],
    [
      'DETAIL + monthly_progress',
      `SELECT i.id, i.name,
        (SELECT COUNT(*)::INT FROM influencer_monthly_progress mp
         WHERE mp.influencer_id = i.id AND mp.shop = $1) AS progress_rows
       FROM influencers i
       WHERE i.shop = $1
       ORDER BY i.id DESC
       LIMIT 1`,
      [SHOP],
    ],
    [
      'STATS summary',
      `SELECT COUNT(*)::INT AS total,
        COUNT(*) FILTER (WHERE next_followup_at IS NOT NULL AND next_followup_at < NOW())::INT AS overdue
       FROM influencers WHERE shop = $1`,
      [SHOP],
    ],
  ];

  const summary = [];
  for (const [label, sql, values] of queries) {
    const { ms } = await timed(label, () => pool.query(sql, values));
    summary.push({ label, ms });
  }

  await pool.end();
  return summary;
}

async function main() {
  console.log('API benchmark');
  console.log(`Base: ${BASE}`);
  console.log(`Shop: ${SHOP}`);
  console.log(`Runs per endpoint: ${RUNS}`);
  console.log('');

  let httpSummary = [];
  try {
    httpSummary = await benchmarkHttp();
    console.log('HTTP endpoints:');
    for (const row of httpSummary) {
      console.log(
        `  ${row.ok ? 'OK' : 'FAIL'} ${row.label} — avg ${row.avg}ms (min ${row.min}, max ${row.max}) status ${row.status}`
      );
    }
  } catch (err) {
    console.log(`HTTP benchmark skipped: ${err.message}`);
  }

  console.log('');
  const dbSummary = await benchmarkDb();
  console.log('Direct DB queries:');
  for (const row of dbSummary) {
    console.log(`  ${row.label} — ${row.ms}ms`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
