import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../src/pages/DashboardPage.jsx', import.meta.url), 'utf8');
const mobileCard = await readFile(
  new URL('../src/components/creator-list/CreatorMobileCard.jsx', import.meta.url),
  'utf8'
);

assert.match(
  page,
  /const \[recordsError, setRecordsError\] = useState\(''\);/,
  'Creator records need an error state independent from action errors.'
);
assert.match(
  page,
  /const recordsRequestIdRef = useRef\(0\);/,
  'Creator record loads need a latest-request guard.'
);
assert.match(
  page,
  /const requestId = recordsRequestIdRef\.current \+= 1;/,
  'Each records request needs an incrementing identity.'
);
assert.match(
  page,
  /if \(requestId !== recordsRequestIdRef\.current\) return;/,
  'Stale records responses must not update the current list state.'
);
assert.match(
  page,
  /\{recordsError \|\| error \? \(/,
  'The banner must show the relevant records or action error.'
);
assert.match(
  mobileCard,
  /followup\.tone \? \(/,
  'The mobile card must render a follow-up state label only when it is semantic, not when it duplicates the date.'
);

console.log('Creator List Step 2 regression contract passed.');
