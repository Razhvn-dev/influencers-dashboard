const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const routeSource = fs.readFileSync(path.join(root, 'routes', 'influencers.js'), 'utf8');
const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const migrationSource = fs.readFileSync(
  path.join(root, 'migrations', '007_add_customer_account_creator_link.sql'),
  'utf8'
);

test('stores a scoped customer account link and visibility flag', () => {
  assert.match(migrationSource, /shopify_customer_id/i);
  assert.match(migrationSource, /customer_account_visible/i);
  assert.match(migrationSource, /UNIQUE INDEX/i);
  assert.match(routeSource, /router\.patch\('\/:id\/customer-account'/);
});

test('exposes the customer program endpoint separately from staff-authenticated APIs', () => {
  assert.match(serverSource, /\/api\/customer-account\/creator-program/);
  assert.match(serverSource, /decodeSessionToken/);
  assert.match(serverSource, /checkAudience:\s*false/);
  assert.match(serverSource, /Array\.isArray\(payload\.aud\)/);
  assert.match(serverSource, /includes\(process\.env\.SHOPIFY_API_KEY\)/);
  assert.match(serverSource, /customer_account_visible = TRUE/);
  assert.match(serverSource, /shopify_customer_id = \$2/);
  assert.match(serverSource, /Access-Control-Allow-Headers/);
});
