import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

const apiBase = `${baseUrl}/api/influencers`;
const payload = {
  name: 'Detail channel QA creator',
  channel: '@detailchannels',
  niche_category: 'Beauty',
  region: 'CA',
  status: 'Partnered',
  youtube_url: 'https://youtube.com/@detailchannels',
  youtube_followers: 182000,
  instagram_url: 'https://instagram.com/detailchannels',
  instagram_followers: 264000,
  facebook_url: '',
  facebook_followers: 0,
  tiktok_url: 'https://tiktok.com/@detailchannels',
  tiktok_followers: 98000,
  sponsored_products: 'Daily Glow Serum',
  affiliate_code: 'DETAILQA',
  commission: '15%',
  required_deliverables: '1 YouTube review + 2 IG stories',
  order_numbers: 'DETAIL-ORDER-01',
  contract_status: 'Active campaign',
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

let creatorId;
let browser;

try {
  creatorId = (await api('', { method: 'POST', body: JSON.stringify(payload) })).id;
  browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${baseUrl}/creators/${creatorId}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('crm-locale', 'en'));
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByText('Social Platforms', { exact: true }).waitFor();
  assert.equal(await page.locator('.crm-detail-platform-row--connected').count(), 3);
  assert.equal(await page.locator('.crm-detail-platform-row--primary').count(), 1);
  assert.equal(await page.locator('.crm-detail-platform-row--disconnected').count(), 0);
  await page.getByRole('button', { name: /disconnected platform/i }).click();
  assert.equal(await page.locator('.crm-detail-platform-row--disconnected').count(), 1);
  await page.getByText('Active campaign', { exact: true }).waitFor();
  await page.getByText('Daily Glow Serum', { exact: true }).waitFor();
  await page.getByText('1 YouTube review + 2 IG stories', { exact: true }).waitFor();

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(150);
    const metrics = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(metrics.scrollWidth <= metrics.viewport, `Detail channel view must not overflow at ${width}px.`);
  }

  console.log('Creator Detail social channels and partnership contract passed.');
} finally {
  if (browser) await browser.close();
  if (creatorId) await api(`/${creatorId}`, { method: 'DELETE' });
}
