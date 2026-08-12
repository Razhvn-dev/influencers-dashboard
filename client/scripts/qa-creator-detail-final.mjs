import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

const apiBase = `${baseUrl}/api/influencers`;
const appBase = baseUrl;
const artifactDirectory = 'C:/Users/Administrator/Desktop/influencers/artifacts/creator-detail-polish-v2';

const completePayload = {
  name: 'Final QA Creator',
  channel: '@finalqa',
  niche_category: 'Beauty',
  region: 'CA',
  status: 'Partnered',
  email: 'finalqa@example.com',
  manager_owner: 'Current User',
  tags: 'VIP, Skincare, Long tag for visual wrapping verification',
  bio: 'Creates practical skincare reviews for an engaged community, with a longer biography to verify readable wrapping in the final profile view.',
  notes: 'Confirmed the September campaign deliverables and shipping address. This longer note validates responsive wrapping without changing the communication hierarchy.',
  youtube_url: 'https://youtube.com/@finalqa',
  youtube_followers: 182000,
  instagram_url: 'https://instagram.com/finalqa',
  instagram_followers: 264000,
  facebook_url: '',
  facebook_followers: 0,
  tiktok_url: 'https://tiktok.com/@finalqa',
  tiktok_followers: 98000,
  sponsored_products: 'Daily Glow Serum',
  affiliate_code: 'FINALGLOW',
  commission: '15%',
  required_deliverables: '1 YouTube review, 2 Instagram stories, and a detailed product routine post with a longer description for wrapping validation.',
  order_numbers: 'FINAL-ORDER-01',
  contract_status: 'Active campaign',
  last_contacted_at: '2026-07-04T09:00',
  next_followup_at: '2026-09-17T09:00',
  monthly_progress: [
    {
      period_index: 1,
      monthly_check_in: 'Kickoff complete',
      content_delivered: 'YouTube review',
      link: 'https://youtube.com/@finalqa',
    },
  ],
};

const sparsePayload = {
  name: 'Sparse QA Creator',
  status: 'Applied',
};

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json();
  assert.equal(response.ok, true, body.message || `API ${path} failed`);
  assert.equal(body.success, true, body.message || `API ${path} failed`);
  return body.data;
}

async function assertNoHorizontalOverflow(page, width, mode) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    headerWidth: document.querySelector('.crm-detail-header')?.getBoundingClientRect().width ?? 0,
    overviewWidth: document.querySelector('.crm-detail-hero-metrics-grid')?.getBoundingClientRect().width ?? 0,
    platformsWidth: document.querySelector('.crm-detail-platform-list')?.getBoundingClientRect().width ?? 0,
    partnershipWidth: document.querySelector('.crm-detail-partnership')?.getBoundingClientRect().width ?? 0,
  }));
  assert.ok(metrics.scrollWidth <= metrics.viewport, `${mode} must not overflow at ${width}px.`);
  for (const [name, value] of Object.entries(metrics)) {
    if (name.endsWith('Width')) assert.ok(value <= metrics.viewport, `${name} must fit at ${width}px.`);
  }
  return metrics;
}

let completeId;
let sparseId;
let browser;

try {
  completeId = (await api('', { method: 'POST', body: JSON.stringify(completePayload) })).id;
  sparseId = (await api('', { method: 'POST', body: JSON.stringify(sparsePayload) })).id;
  assert.ok(completeId && sparseId, 'Both temporary QA creators must be created.');

  browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(`${appBase}/creators/${completeId}`, { waitUntil: 'networkidle', timeout: 60000 });

  for (const label of ['Social Platforms', 'Partnership', 'Creator Profile', 'Communication', 'Monthly Progress', 'Recent changes']) {
    await page.getByText(label, { exact: true }).waitFor();
  }
  await page.getByRole('button', { name: 'Back to creators', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit creator', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Delete', exact: true }).waitFor();
  await page.getByText('1 of 5 periods complete', { exact: true }).waitFor();

  await mkdir(artifactDirectory, { recursive: true });
  await page.screenshot({ path: `${artifactDirectory}/creator-detail-final-1440.png`, fullPage: true });

  await page.getByRole('button', { name: 'Back to creators', exact: true }).click();
  await page.waitForURL(`${appBase}/`, { timeout: 15000 });
  await page.goto(`${appBase}/creators/${completeId}`, { waitUntil: 'networkidle' });
  await page.getByText('Social Platforms', { exact: true }).waitFor();

  const popupPromise = page.waitForEvent('popup');
  await page.getByLabel('Open YouTube profile').click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded').catch(() => {});
  assert.match(popup.url(), /youtube\.com/i, 'Platform external action must use its existing profile URL.');
  await popup.close();

  await page.getByRole('button', { name: 'Show details', exact: true }).click();
  await page.getByRole('button', { name: 'Hide details', exact: true }).waitFor();

  const viewResponsive = [];
  for (const width of [1440, 1270, 900, 768, 640, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(150);
    viewResponsive.push({ width, ...await assertNoHorizontalOverflow(page, width, 'View mode') });
  }
  await page.screenshot({ path: `${artifactDirectory}/creator-detail-final-390.png`, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.getByRole('button', { name: 'Edit creator', exact: true }).click();
  for (const label of [
    'Creator Name',
    'Username / Handle',
    'Niche / Category',
    'Bio',
    'Follow-up status',
    'Contract status',
    'Next follow-up',
    'Reminder Time',
    'Sponsored Product(s)',
    'Affiliate Code',
    'Commission',
    'Notes',
    'Last Contacted',
    'Email',
    'Region',
    'Tags',
  ]) {
    await page.getByLabel(label, { exact: true }).first().waitFor();
  }
  await page.getByRole('heading', { name: 'Add supporting details', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Monthly Progress', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Review before saving', exact: true }).waitFor();
  await page.getByRole('navigation', { name: 'Edit sections' }).waitFor();
  await page.locator('.crm-add-creator__platform-table').waitFor();
  await page.getByRole('button', { name: 'Cancel editing', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Save Changes', exact: true }).waitFor();

  const editResponsive = [];
  for (const width of [1440, 900, 640, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(150);
    editResponsive.push({ width, ...await assertNoHorizontalOverflow(page, width, 'Edit mode') });
  }

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.getByLabel('Bio', { exact: true }).fill('Final QA saved supporting detail.');
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  await page.getByRole('button', { name: 'Edit creator', exact: true }).waitFor({ timeout: 15000 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Final QA saved supporting detail.', { exact: true }).waitFor();
  assert.equal((await api(`/${completeId}`)).bio, 'Final QA saved supporting detail.');

  await page.getByRole('button', { name: 'Edit creator', exact: true }).click();
  await page.getByLabel('Bio', { exact: true }).fill('Discard this QA value');
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await page.getByText('Discard unsaved changes?', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Discard changes', exact: true }).last().click();
  await page.getByRole('button', { name: 'Edit creator', exact: true }).waitFor({ timeout: 15000 });

  await page.goto(`${appBase}/creators/${sparseId}`, { waitUntil: 'networkidle' });
  await page.getByText('Creator Profile', { exact: true }).waitFor();
  await page.getByText('No communication notes yet.', { exact: true }).waitFor();
  assert.equal(
    await page.locator('.crm-detail-platform-row--disconnected').count(),
    0,
    'Disconnected platforms must be collapsed by default.'
  );
  await page.getByRole('button', { name: /disconnected platform/i }).click();
  assert.equal(
    await page.locator('.crm-detail-platform-row--disconnected').count(),
    4,
    'Sparse creator must show four calm unconnected rows when expanded.'
  );
  assert.equal(await page.locator('text=undefined').count(), 0, 'Sparse creator must not render undefined values.');
  const sparsePartnershipHeight = await page.locator('.crm-detail-partnership').evaluate((node) => node.getBoundingClientRect().height);
  assert.ok(sparsePartnershipHeight < 260, 'Sparse partnership summary must remain compact.');
  const sparseProfileHeight = await page.locator('.crm-detail-supporting-profile, .crm-detail-supporting-section').first().evaluate((node) => node.getBoundingClientRect().height);
  assert.ok(sparseProfileHeight < 420, 'Sparse profile must remain compact when only default ownership is present.');
  const sparseResponsive = await assertNoHorizontalOverflow(page, 1440, 'Sparse view mode');

  console.log(JSON.stringify({
    completeId,
    sparseId,
    screenshots: [
      `${artifactDirectory}/creator-detail-final-1440.png`,
      `${artifactDirectory}/creator-detail-final-390.png`,
    ],
    viewResponsive,
    editResponsive,
    sparseResponsive,
    externalLink: 'passed',
    progressExpansion: 'passed',
    saveReload: 'passed',
    discardConfirmation: 'passed',
  }, null, 2));
} finally {
  if (browser) await browser.close();
  if (completeId) await api(`/${completeId}`, { method: 'DELETE' });
  if (sparseId) await api(`/${sparseId}`, { method: 'DELETE' });
  console.log(`Deleted temporary creators ${completeId ?? 'n/a'} and ${sparseId ?? 'n/a'}.`);
}
