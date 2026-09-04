const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeCustomerAccountSubject } = require('../lib/customerAccountToken');

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
