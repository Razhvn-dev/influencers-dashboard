const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const test = require('node:test');

test('creator identity migration adds nullable business and legal-name columns without backfill', () => {
  const migration = readFileSync(
    resolve(__dirname, '../migrations/006_add_creator_identity_fields.sql'),
    'utf8'
  );

  assert.match(migration, /ADD COLUMN IF NOT EXISTS business_name TEXT/i);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS first_name TEXT/i);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS last_name TEXT/i);
  assert.doesNotMatch(migration, /UPDATE\s+influencers\s+SET\s+first_name/i);
  assert.doesNotMatch(migration, /UPDATE\s+influencers\s+SET\s+last_name/i);
});

test('migration runner includes creator identity migration', () => {
  const runner = readFileSync(resolve(__dirname, '../scripts/run-migrations.mjs'), 'utf8');

  assert.match(runner, /"migrations\/006_add_creator_identity_fields\.sql"/);
});

test('base schema does not reference identity columns before their additive migration runs', () => {
  const schema = readFileSync(resolve(__dirname, '../init.sql'), 'utf8');

  assert.doesNotMatch(schema, /business_name/);
  assert.doesNotMatch(schema, /first_name/);
  assert.doesNotMatch(schema, /last_name/);
});
