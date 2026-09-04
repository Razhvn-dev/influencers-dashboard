const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeCustomerAccountLink,
  toCustomerAccountProfile,
} = require('../lib/customerAccountProfile');

test('normalizes a numeric Shopify customer id into a customer GID', () => {
  assert.deepEqual(
    normalizeCustomerAccountLink({ shopify_customer_id: '123456789', customer_account_visible: true }),
    {
      shopify_customer_id: 'gid://shopify/Customer/123456789',
      customer_account_visible: true,
    }
  );
});

test('does not allow a customer account profile to be visible without a linked customer', () => {
  assert.throws(
    () => normalizeCustomerAccountLink({ customer_account_visible: true }),
    /shopify_customer_id/i
  );
});

test('returns only customer-safe creator program fields', () => {
  assert.deepEqual(
    toCustomerAccountProfile({
      business_name: 'Grimes Outdoors',
      first_name: 'Russell',
      last_name: 'Grimes',
      channel: '@grimesoutdoors',
      status: 'Active Ambassador',
      affiliate_code: 'RUSSELL10',
      commission: 'YES',
      niche_category: 'Outdoors',
      bio: 'Trail reviews and repairs.',
      notes: 'Internal negotiation notes',
      manager_owner: 'Staff Only',
      next_followup_at: '2026-09-10T08:00:00.000Z',
    }),
    {
      business_name: 'Grimes Outdoors',
      first_name: 'Russell',
      last_name: 'Grimes',
      channel: '@grimesoutdoors',
      status: 'Active Ambassador',
      affiliate_code: 'RUSSELL10',
      commission: 'YES',
      niche_category: 'Outdoors',
      bio: 'Trail reviews and repairs.',
    }
  );
});
