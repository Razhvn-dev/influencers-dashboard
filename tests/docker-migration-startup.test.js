const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('production container runs migrations before starting the app', () => {
  const dockerfile = fs.readFileSync(path.join(__dirname, '..', 'Dockerfile'), 'utf8');

  assert.match(
    dockerfile,
    /CMD\s+\["sh",\s*"-c",\s*"npm run migrate && exec npm start"\]/,
  );
});
