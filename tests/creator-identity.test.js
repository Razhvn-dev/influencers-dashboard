const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getCreatorLegalName,
  getCreatorPrimaryIdentity,
  normalizeCreatorIdentity,
} = require('../lib/creatorIdentity');

test('new creators require business name and first name', () => {
  assert.throws(
    () => normalizeCreatorIdentity({ first_name: 'Russell' }),
    /"business_name" is required/
  );
  assert.throws(
    () => normalizeCreatorIdentity({ business_name: 'Grimes Outdoors' }),
    /"first_name" is required/
  );
});

test('creator identity derives compatibility name without double spaces', () => {
  assert.deepEqual(
    normalizeCreatorIdentity({
      business_name: 'Jay Builds',
      first_name: 'Jay',
      last_name: '',
    }),
    {
      business_name: 'Jay Builds',
      first_name: 'Jay',
      last_name: null,
      name: 'Jay',
    }
  );
});

test('legacy creator identity remains valid without automatic name splitting', () => {
  assert.deepEqual(
    normalizeCreatorIdentity({}, { id: 42, name: 'Legacy Creator' }),
    {
      business_name: null,
      first_name: null,
      last_name: null,
      name: 'Legacy Creator',
    }
  );
});

test('display helpers prefer business identity and retain legacy fallback', () => {
  assert.equal(
    getCreatorPrimaryIdentity({ business_name: 'Grimes Outdoors', name: 'Russell Grimes' }),
    'Grimes Outdoors'
  );
  assert.equal(getCreatorPrimaryIdentity({ name: 'Legacy Creator' }), 'Legacy Creator');
  assert.equal(getCreatorLegalName({ first_name: 'Russell', last_name: 'Grimes' }), 'Russell Grimes');
});
