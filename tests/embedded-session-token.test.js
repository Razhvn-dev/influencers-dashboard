const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const main = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'main.jsx'), 'utf8');

test('embedded navigation keeps the initial Shopify session token after the URL query is removed', () => {
  assert.match(
    main,
    /let initialShopifySessionToken = null;/,
    'the initial id_token must be retained before React Router removes the query string'
  );
  assert.match(
    main,
    /if \(token\) \{\s*initialShopifySessionToken = token;\s*\}/,
    'the first embedded request must retain its id_token in memory'
  );
  assert.match(
    main,
    /return initialShopifySessionToken;/,
    'API calls on nested client routes must read the retained token'
  );
  assert.match(
    main,
    /typeof window\.shopify\?\.idToken === 'function'/,
    'fresh App Bridge tokens must take precedence over the initial URL token'
  );
});
