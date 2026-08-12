import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../src/', import.meta.url);
const page = await readFile(new URL('pages/DashboardPage.jsx', root), 'utf8');

for (const component of [
  'components/creator-list/CreatorResourceRow.jsx',
  'components/creator-list/CreatorIdentityCell.jsx',
  'components/creator-list/CreatorPlatformCell.jsx',
  'components/creator-list/CreatorActivityCell.jsx',
]) {
  await access(new URL(component, root));
}

assert.match(page, /import CreatorResourceRow from '..\/components\/creator-list\/CreatorResourceRow';/);
assert.match(page, /<CreatorResourceRow[\s\S]*record=\{record\}[\s\S]*followupEmphasis=\{followupEmphasis\}/);
assert.match(page, /\{ title: t\('dashboard\.columns\.platforms'\) \}/);
assert.match(page, /\{ title: t\('dashboard\.columns\.activity'\) \}/);
assert.match(page, /\{ title: t\('dashboard\.columns\.nextFollowup'\) \}/);
assert.match(page, /sortable=\{\[true, false, true, true, true, false, true\]\}/);

console.log('Creator resource row contract passed.');
