const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeSpreadsheetText } = require('../lib/spreadsheetSafety');
const { exportInfluencersCsv } = require('../lib/influencersCsv');
const { exportSponsorshipCsv } = require('../lib/sponsorshipCsv');

test('neutralizes spreadsheet formulas while preserving ordinary values', () => {
  assert.equal(sanitizeSpreadsheetText('=HYPERLINK("https://bad.example")'), "'=HYPERLINK(\"https://bad.example\")");
  assert.equal(sanitizeSpreadsheetText('  +SUM(A1:A2)'), "'  +SUM(A1:A2)");
  assert.equal(sanitizeSpreadsheetText('@cmd'), "'@cmd");
  assert.equal(sanitizeSpreadsheetText('Creator name'), 'Creator name');
  assert.equal(sanitizeSpreadsheetText(42), '42');
});

test('CSV exports apply formula protection to creator-controlled values', () => {
  const influencerCsv = exportInfluencersCsv([{ name: '=SUM(1,1)' }]);
  const sponsorshipCsv = exportSponsorshipCsv([{ name: '=SUM(1,1)', monthly_progress: [] }]);

  assert.match(influencerCsv, /"'=SUM\(1,1\)"/);
  assert.match(sponsorshipCsv, /"'=SUM\(1,1\)"/);
});
