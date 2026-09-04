const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('the embedded app can read the Shopify API key injected into index.html', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'client', 'src', 'main.jsx'),
    'utf8'
  );

  assert.match(source, /meta\[name="shopify-api-key"\]/);
  assert.match(source, /VITE_SHOPIFY_API_KEY/);
});
