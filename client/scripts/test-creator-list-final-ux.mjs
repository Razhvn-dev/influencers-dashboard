import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../src/', import.meta.url);
const page = await readFile(new URL('pages/DashboardPage.jsx', root), 'utf8');
const toolbar = await readFile(new URL('components/DashboardFilterBar.jsx', root), 'utf8');
const header = await readFile(new URL('components/DashboardPageHeader.jsx', root), 'utf8');
const mobileCard = await readFile(new URL('components/creator-list/CreatorMobileCard.jsx', root), 'utf8');
const css = await readFile(new URL('styles/crm-dashboard.css', root), 'utf8');

for (const component of [
  'components/creator-list/CreatorMobileCardList.jsx',
  'components/creator-list/CreatorMobileCard.jsx',
  'components/creator-list/CreatorListEmptyState.jsx',
]) {
  await access(new URL(component, root));
}

assert.match(toolbar, /onSearchChange/);
assert.match(toolbar, /t\('filters\.moreFilters'\)/);
assert.match(toolbar, /onDueFollowupFilterChange/);
assert.match(toolbar, /onCommissionFilterChange/);
assert.match(page, /<CreatorMobileCardList[\s\S]*records=\{paginatedRecords\}/);
assert.match(mobileCard, /onClick=\{onNavigate\}/);
assert.match(mobileCard, />—<\/span>/);
assert.doesNotMatch(mobileCard, /鈥/);
assert.match(page, /<CreatorListEmptyState[\s\S]*onAddCreator=\{\(\) => navigate\('\/creators\/new'\)\}/);
assert.match(css, /\.crm-creator-mobile-list\s*\{/);
assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.crm-dashboard-v2 \.crm-v2-table\s*\{[\s\S]*?display:\s*none/s);
assert.match(header, /<div className="crm-v2-header__actions">/);
assert.match(css, /@media \(max-width: 480px\)[\s\S]*?\.crm-dashboard-v2 \.crm-v2-header__actions > \.Polaris-InlineStack\s*\{[\s\S]*?display:\s*grid/s);
assert.match(css, /grid-template-columns:\s*max-content\s+max-content\s+minmax\(0,\s*1fr\)/);
assert.match(css, /crm-v2-header__actions > \.Polaris-InlineStack > \.Polaris-Button:last-child\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1/s);

console.log('Creator List final UX contract passed.');
