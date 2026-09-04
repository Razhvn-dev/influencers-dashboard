const assert = require('node:assert/strict');
const test = require('node:test');

const { buildExportColumns } = require('../lib/influencersExport');
const { SPONSORSHIP_EXPORT_HEADER, parseSponsorshipCsv } = require('../lib/sponsorshipCsv');

test('detailed exports put creator identity fields before compatibility name', () => {
  assert.deepEqual(
    buildExportColumns().slice(0, 4).map((column) => column.label),
    ['Business / Channel Name', 'First Name', 'Last Name', 'Name']
  );
});

test('sponsorship CSV keeps its legacy name and channel columns', () => {
  assert.match(SPONSORSHIP_EXPORT_HEADER, /^Name,Channel,/);
  const [record] = parseSponsorshipCsv('Name,Channel\nLegacy Creator,@legacy\n');
  assert.equal(record.name, 'Legacy Creator');
  assert.equal(record.channel, '@legacy');
});
