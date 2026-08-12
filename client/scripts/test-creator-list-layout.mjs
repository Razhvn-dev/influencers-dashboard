import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../src/', import.meta.url);
const page = await readFile(new URL('pages/DashboardPage.jsx', root), 'utf8');

for (const component of [
  'components/creator-list/CreatorListHeader.jsx',
  'components/creator-list/CreatorListToolbar.jsx',
  'components/creator-list/CreatorListContent.jsx',
]) {
  await access(new URL(component, root));
}

assert.match(page, /import CreatorListHeader from '..\/components\/creator-list\/CreatorListHeader';/);
assert.match(page, /import CreatorListToolbar from '..\/components\/creator-list\/CreatorListToolbar';/);
assert.match(page, /import CreatorListContent from '..\/components\/creator-list\/CreatorListContent';/);
assert.match(page, /<CreatorListHeader[\s\S]*onAddCreator=\{\(\) => navigate\('\/creators\/new'\)\}/);
assert.match(page, /<CreatorListToolbar[\s\S]*onStatusFilterChange=\{setStatusFilter\}/);
assert.match(page, /<CreatorListContent[\s\S]*itemCount=\{displayRecords\.length\}/);

console.log('Creator List layout contract passed.');
