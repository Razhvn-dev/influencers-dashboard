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

test('the production server injects the public Shopify API key when it serves index.html', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'client', 'index.html'), 'utf8');

  assert.match(indexHtml, /__SHOPIFY_API_KEY__/);
  assert.match(serverSource, /replaceAll\('__SHOPIFY_API_KEY__', process\.env\.SHOPIFY_API_KEY \|\| ''\)/);
  assert.match(serverSource, /res\.type\('html'\)\.send\(html\)/);
});
