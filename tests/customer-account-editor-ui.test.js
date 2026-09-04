const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('the active Creator edit form exposes customer account linking controls', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'client', 'src', 'components', 'CreatorDetailEditForm.jsx'),
    'utf8'
  );

  assert.match(source, /shopify_customer_id/);
  assert.match(source, /customer_account_visible/);
  assert.match(source, /customerAccountVisible/);
});
