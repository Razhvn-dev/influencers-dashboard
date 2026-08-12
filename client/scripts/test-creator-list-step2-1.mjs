import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const desktopRow = await readFile(
  new URL('../src/components/creator-list/CreatorResourceRow.jsx', import.meta.url),
  'utf8'
);

assert.doesNotMatch(
  desktopRow,
  /if \(!record\.next_followup_at \|\| !followupEmphasis\)/,
  'A valid follow-up date must render even when it has no semantic emphasis state.'
);
assert.match(
  desktopRow,
  /\{followupEmphasis\?\.tone \? <span/,
  'Desktop rows must render the auxiliary follow-up label only for a semantic state.'
);

console.log('Creator List Step 2.1 desktop follow-up contract passed.');
