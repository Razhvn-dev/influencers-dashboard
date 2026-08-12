import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

const apiBase = `${baseUrl}/api/influencers`;
const appBase = baseUrl;
const artifactDirectory = 'C:/Users/Administrator/Desktop/influencers/artifacts/creator-core-i18n';
let id;
let browser;

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message || `Request failed: ${path}`);
  return body.data;
}

try {
  id = (await request('', { method: 'POST', body: JSON.stringify({
    name: 'i18n QA Creator', channel: '@i18nqa', niche_category: 'Beauty', region: 'CA',
    status: 'Partnered', email: 'i18n@example.com', manager_owner: 'Current User', tags: 'VIP, Skincare',
    bio: 'Creator profile used only to verify English and Chinese UI rendering.',
    notes: 'Verified Chinese and English copy in the final CRM profile.',
    youtube_url: 'https://youtube.com/@i18nqa', youtube_followers: 182000,
    instagram_url: 'https://instagram.com/i18nqa', instagram_followers: 264000,
    facebook_url: '', facebook_followers: 0,
    tiktok_url: 'https://tiktok.com/@i18nqa', tiktok_followers: 98000,
    sponsored_products: 'Daily Glow Serum', affiliate_code: 'I18NQA', commission: 'YES',
    order_numbers: 'I18N-01', required_deliverables: '1 review and 2 stories', contract_status: 'Active campaign',
    last_contacted_at: '2026-07-04T09:00', next_followup_at: '2026-09-17T09:00',
    monthly_progress: [{ period_index: 1, monthly_check_in: 'YES', content_delivered: 'Review', link: 'https://youtube.com/@i18nqa' }],
  }) })).id;
  await mkdir(artifactDirectory, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  for (const [route, name] of [['/', 'creator-list'], ['/creators/new', 'add-creator'], [`/creators/${id}`, 'creator-detail']]) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${appBase}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.setItem('crm-locale', 'zh'));
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const metrics = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, text: document.body.innerText }));
      if (metrics.scrollWidth > metrics.viewport) throw new Error(`${name} overflows at ${width}px`);
      if (metrics.text.includes('creatorDetail.') || metrics.text.includes('creatorCreate.')) throw new Error(`${name} shows raw i18n key at ${width}px`);
      await page.screenshot({ path: `${artifactDirectory}/${name}-zh-${width}.png`, fullPage: true });
    }
  }
  console.log(JSON.stringify({ id, artifactDirectory, locale: 'zh', status: 'passed' }));
} finally {
  if (browser) await browser.close();
  if (id) await request(`/${id}`, { method: 'DELETE' });
  console.log(`Deleted temporary creator ${id ?? 'n/a'}.`);
}
