const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const locale of ['en', 'zh']) {
  test(`the ${locale} Creator detail locale labels the customer account editor`, () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'client', 'src', 'i18n', 'locales', `${locale}.js`),
      'utf8'
    );
    const start = source.indexOf('  creatorDetail: {');
    const end = source.indexOf('  importCsv:', start);
    const creatorDetail = start >= 0 && end > start ? source.slice(start, end) : '';

    for (const key of [
      'customerAccount',
      'shopifyCustomerId',
      'shopifyCustomerIdHelp',
      'customerAccountVisible',
      'customerAccountVisibleHelp',
    ]) {
      assert.match(creatorDetail, new RegExp(`\\b${key}:`));
    }
  });
}
