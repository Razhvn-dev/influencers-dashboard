const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const test = require('node:test');

test('creator update passes the stored record to identity normalization as existing data', () => {
  const source = readFileSync(resolve(__dirname, '../routes/influencers.js'), 'utf8');

  assert.match(source, /buildRecordPayload\(req\.body, existing\)/);
  assert.doesNotMatch(source, /buildRecordPayload\(\{ \.\.\.existing, \.\.\.req\.body \}\)/);
});
