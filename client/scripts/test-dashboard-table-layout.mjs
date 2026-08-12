import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/styles/crm-dashboard.css', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/pages/DashboardPage.jsx', import.meta.url), 'utf8');

assert.match(
  css,
  /\.crm-v2-table \.Polaris-IndexTable__Table\s*\{[^}]*table-layout:\s*fixed;[^}]*width:\s*100%;/s,
  'the table must fit the embedded-admin width',
);
assert.match(
  css,
  /\.crm-v2-table \.Polaris-IndexTable-ScrollContainer\s*\{[^}]*overflow-x:\s*hidden;/s,
  'the table must not show a horizontal scrollbar',
);
assert.match(page, /<CreatorResourceRow[\s\S]*record=\{record\}/);
assert.match(page, /\{ title: t\('dashboard\.columns\.platforms'\) \}/);
assert.match(page, /\{ title: t\('dashboard\.columns\.activity'\) \}/);
assert.doesNotMatch(page, /<PlatformIndicators record=\{record\}/);
assert.match(
  page,
  /sortable=\{\[true, false, true, true, true, false, true\]\}/,
  'sortable behavior must remain aligned with the reordered resource columns',
);
assert.match(
  css,
  /\.crm-v2-table \.Polaris-IndexTable__TableHeading:nth-child\(2\),\s*\.crm-v2-table \.crm-creator-table__creator-cell\s*\{[^}]*width:\s*190px;/s,
);
assert.match(
  css,
  /\.crm-dashboard-v2 \.crm-v2-table \.Polaris-IndexTable__TableHeading:nth-child\(3\),[\s\S]*?\{[^}]*width:\s*155px;/,
  'platform resources need a dedicated readable column',
);
assert.match(
  css,
  /\.crm-dashboard-v2 \.crm-v2-table \.Polaris-IndexTable__TableHeading:nth-child\(4\),[\s\S]*?\{[^}]*width:\s*90px;/,
  'followers need a compact, readable numeric column',
);
assert.match(
  css,
  /\.crm-resource-activity__line\s*\{/,
  'secondary activity details must be grouped into an activity cell',
);
assert.match(
  css,
  /\.crm-resource-platforms__item\s*\{/,
  'platform resources must pair icon, name, and connection state',
);

console.log('Creator resource table layout contract passed.');
