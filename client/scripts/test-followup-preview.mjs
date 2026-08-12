import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

function previewFollowup(page) {
  return page.evaluate(() => {
    const row = [...document.querySelectorAll('.crm-creator-preview__meta-list > div')].find(
      (node) => node.querySelector('dt')?.textContent?.trim().toLowerCase() === 'next follow-up'
    );
    return row?.querySelector('dd')?.textContent?.trim() ?? null;
  });
}

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
try {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/creators/new`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('crm-locale', 'en'));
  await page.reload({ waitUntil: 'networkidle' });

  await page.evaluate(() => window.__crmSetFollowup?.('2026-07-17T23:17'));
  await page.waitForTimeout(150);
  assert.equal(await previewFollowup(page), 'Jul 17, 2026, 11:17 PM');

  console.log('Follow-up preview updates from current form state.');
} finally {
  await browser.close();
}
