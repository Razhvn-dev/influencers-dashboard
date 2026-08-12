import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const [en, zh, addPage, basicInfo, platformConnection, preview, summary, detailPage, platformAccounts, platformCard, profilePanel, notesCard, progress, recentActivity] = await Promise.all([
  read('src/i18n/locales/en.js'),
  read('src/i18n/locales/zh.js'),
  read('src/pages/AddCreatorPage.jsx'),
  read('src/components/add-creator/BasicInformationCard.jsx'),
  read('src/components/add-creator/PlatformConnectionCard.jsx'),
  read('src/components/add-creator/CreatorPreviewCard.jsx'),
  read('src/components/add-creator/PlatformSummaryCard.jsx'),
  read('src/pages/CreatorDetailPage.jsx'),
  read('src/components/CreatorPlatformAccounts.jsx'),
  read('src/components/CreatorPlatformProfileCard.jsx'),
  read('src/components/CreatorProfilePanel.jsx'),
  read('src/components/CreatorNotesCard.jsx'),
  read('src/components/CreatorMonthlyProgressSection.jsx'),
  read('src/components/CreatorRecentActivity.jsx'),
]);

for (const [locale, source] of [['en', en], ['zh', zh]]) {
  for (const key of ['connected:', 'notConnected:', 'notSet:', 'primary:', 'emptyValue:', 'creatorCreate:', 'creatorDetail:', 'importCsv:', 'progress:']) {
    assert.match(source, new RegExp(`\\b${key}`), `${locale} must provide ${key}`);
  }
}

for (const [name, source] of [
  ['AddCreatorPage', addPage],
  ['BasicInformationCard', basicInfo],
  ['PlatformConnectionCard', platformConnection],
  ['CreatorPreviewCard', preview],
  ['PlatformSummaryCard', summary],
  ['CreatorPlatformAccounts', platformAccounts],
  ['CreatorPlatformProfileCard', platformCard],
  ['CreatorProfilePanel', profilePanel],
  ['CreatorNotesCard', notesCard],
  ['CreatorMonthlyProgressSection', progress],
  ['CreatorRecentActivity', recentActivity],
]) {
  assert.match(source, /useTranslation/, `${name} must use the project translation hook.`);
}

for (const hardcodedCopy of [
  'Basic Information',
  'Channel details added',
  'Live profile',
  'Platform Summary',
  'Partnership & Follow-up',
  'Social Platforms',
  'Partnership status',
  'Monthly Progress',
  'Recent changes',
]) {
  assert.doesNotMatch(
    `${addPage}\n${basicInfo}\n${platformConnection}\n${preview}\n${summary}\n${platformAccounts}\n${platformCard}\n${profilePanel}\n${notesCard}\n${progress}\n${recentActivity}`,
    new RegExp(`['\"]${hardcodedCopy}['\"]`),
    `${hardcodedCopy} must be translated rather than hard-coded.`
  );
}

assert.match(detailPage, /crm-detail-view-layout/, 'Detail view mode must use the consolidated view layout.');
assert.match(detailPage, /CreatorDetailSupportingSurface/, 'Detail view mode must consolidate supporting content in one surface.');
assert.match(platformAccounts, /crm-detail-channel-surface/, 'Social platforms must render in one shared channel surface.');
assert.doesNotMatch(platformCard, /<article/, 'Individual platform profiles must be resource rows, not independent cards.');

console.log('Creator Core i18n and Detail surface contract passed.');
