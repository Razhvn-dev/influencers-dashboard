import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const hook = await readFile(
  new URL('../src/hooks/useIndexTableColumnLayout.js', import.meta.url),
  'utf8',
);

assert.match(
  hook,
  /function syncStickyHeaderLayout\(tableRoot\)/,
  'custom column widths must explicitly resync Polaris sticky headers',
);
assert.match(
  hook,
  /\[data-index-table-heading\]/,
  'the sync must read the rendered table header widths',
);
assert.match(
  hook,
  /\[data-index-table-sticky-heading\]/,
  'the sync must update the cloned sticky headers',
);
assert.match(
  hook,
  /stickyHeading\.style\.minWidth\s*=\s*`\$\{tableHeading\.offsetWidth\}px`/,
  'each sticky header must receive the exact corresponding table column width',
);

console.log('Sticky IndexTable header alignment contract passed.');
