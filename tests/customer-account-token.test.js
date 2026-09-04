const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeCustomerAccountSubject,
  normalizeCustomerAccountDestination,
} = require('../lib/customerAccountToken');

test('accepts both Shopify Customer GID and numeric session token subjects', () => {
  assert.equal(
    normalizeCustomerAccountSubject('gid://shopify/Customer/9316481433806'),
    'gid://shopify/Customer/9316481433806'
  );
  assert.equal(
    normalizeCustomerAccountSubject('9316481433806'),
    'gid://shopify/Customer/9316481433806'
  );
  assert.equal(normalizeCustomerAccountSubject(''), null);
});

test('accepts session token destinations with or without a URL scheme', () => {
  assert.equal(
    normalizeCustomerAccountDestination('https://afinjections.myshopify.com'),
    'afinjections.myshopify.com'
  );
  assert.equal(
    normalizeCustomerAccountDestination('afinjections.myshopify.com'),
    'afinjections.myshopify.com'
  );
  assert.equal(normalizeCustomerAccountDestination(null), null);
});
