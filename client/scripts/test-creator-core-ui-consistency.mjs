import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [dashboardStyles, addCreatorStyles, detailStyles] = await Promise.all([
  readFile(new URL('../src/styles/crm-dashboard.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/add-creator.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/crm-ui.css', import.meta.url), 'utf8'),
]);

assert.match(
  dashboardStyles,
  /\.crm-dashboard-v2 \.crm-v2-header__actions \.Polaris-Button--variantPrimary\s*\{[\s\S]*?min-height:\s*32px;[\s\S]*?font-size:\s*12px;[\s\S]*?font-weight:\s*700;/,
  'Creator List primary action must use the compact Creator action specification.'
);

assert.match(
  addCreatorStyles,
  /\.crm-add-creator__footer-actions \.Polaris-Button\s*\{[\s\S]*?min-height:\s*32px;[\s\S]*?font-size:\s*12px;[\s\S]*?font-weight:\s*700;/,
  'Add Creator footer actions must use the same compact Creator action specification.'
);

assert.match(
  detailStyles,
  /\.crm-detail-header__actions \.Polaris-Button\s*\{[\s\S]*?min-height:\s*32px;[\s\S]*?font-size:\s*12px;[\s\S]*?font-weight:\s*700;/,
  'Creator Detail header actions establish the compact Creator action specification.'
);

assert.match(
  dashboardStyles,
  /\.crm-dashboard-v2 \.crm-v2-header__actions \.Polaris-Button--variantPrimary,[\s\S]*?min-height:\s*34px !important;/,
  'The current dashboard polish must deliberately override the compact legacy action sizing.'
);

assert.match(
  addCreatorStyles,
  /\.crm-add-creator-v2 \.crm-add-creator__footer-actions \.Polaris-Button\s*\{[\s\S]*?min-height:\s*32px;/,
  'The current Add Creator footer action sizing must remain explicitly defined.'
);

console.log('Creator Core UI action consistency contract passed.');
