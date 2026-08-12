import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/styles/crm-dashboard.css', import.meta.url), 'utf8');
const dashboardPage = await readFile(new URL('../src/pages/DashboardPage.jsx', import.meta.url), 'utf8');

assert.match(css, /Dashboard polish: preserve structure, refine hierarchy/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-header\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-table\s+\.Polaris-IndexTable__TableRow:hover\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-toolbar\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-toolbar::before\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-kpi-card--alert::after\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-table__followup-cell\s+\.crm-followup-overdue\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-table__verified-cell\s+\.crm-table-date\s*,/);
assert.match(css, /Dashboard refinement pass/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-kpi-card__hint/);
assert.match(css, /@media \(max-width: 1200px\)[\s\S]*crm-v2-table__verified-cell/);
assert.match(css, /Homepage visible refinement/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-dashboard-v2__metrics-wrap\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-toolbar\s*\{/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-table\s+\.Polaris-IndexTable__TableHeading/);
assert.match(dashboardPage, /className="crm-dashboard-v2__shell crm-dashboard-v2"/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-toolbar::before\s*\{[\s\S]*content:\s*none/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-dashboard-v2__metrics--followups\s*\{[\s\S]*max-width:\s*none/);
assert.match(css, /\.crm-dashboard-v2\s+\.crm-v2-table__verified-cell\s+\.crm-table-date[\s\S]*color:\s*#667085/);

console.log('Dashboard visual-polish rules are present.');
