import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
try {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/creators/new`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('crm-locale', 'en'));
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'Choose next follow-up date', exact: true }).click();
  await page.locator('button.Polaris-DatePicker__Day').filter({ hasText: /^17$/ }).first().click();
  const selectedDate = await page.getByLabel('Next follow-up', { exact: true }).inputValue();
  assert.notEqual(selectedDate, '', 'Selecting a calendar day must update the visible date control.');

  for (const label of ['Hour', 'Minute', 'AM/PM']) {
    await page.getByRole('button', { name: label, exact: true }).waitFor();
  }

  console.log('Follow-up calendar and reminder controls contract passed.');
} finally {
  await browser.close();
}
