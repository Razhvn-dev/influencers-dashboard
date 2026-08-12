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

  assert.equal(await previewFollowup(page), 'Not set', 'A new creator must not invent a follow-up date.');

  await page.evaluate(() => window.__crmSetFollowup?.('2026-07-17T09:00'));
  await page.waitForTimeout(150);
  assert.equal(await previewFollowup(page), 'Jul 17, 2026, 9:00 AM', 'Selecting a date first must preserve the default reminder time.');

  await page.evaluate(() => window.__crmSetFollowup?.('2026-07-17T23:17'));
  await page.waitForTimeout(150);
  assert.equal(await previewFollowup(page), 'Jul 17, 2026, 11:17 PM', 'Changing the reminder time must update the same follow-up date.');

  console.log('Follow-up date-first preview contract passed.');
} finally {
  await browser.close();
}
