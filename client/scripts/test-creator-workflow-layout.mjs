import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const addPage = await readFile(new URL('../src/pages/AddCreatorPage.jsx', import.meta.url), 'utf8');
const detailPage = await readFile(new URL('../src/pages/CreatorDetailPage.jsx', import.meta.url), 'utf8');
const metrics = await readFile(new URL('../src/components/CreatorDetailSummaryMetrics.jsx', import.meta.url), 'utf8');

assert.match(addPage, /additionalDetailsOpen/);
assert.match(addPage, /<AdditionalDetailsSection/);
assert.match(detailPage, /<CreatorProfilePanel/);
assert.match(detailPage, /<CreatorSponsorshipDetails/);
assert.match(detailPage, /<CreatorPlatformAccounts/);
assert.match(detailPage, /<CreatorMonthlyProgressSection/);
assert.match(metrics, /t\('creatorDetail\.nextFollowup'\)/);

console.log('Creator workflow layout contract passed.');
