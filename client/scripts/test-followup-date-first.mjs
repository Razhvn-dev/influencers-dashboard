import { chromium } from 'playwright';

const url = 'http://localhost:5173/creators/new';

async function getPreview(page) {
  return page.evaluate(() => {
    const block = [...document.querySelectorAll('.crm-add-creator-preview__meta-block')].find((el) =>
      el.textContent?.includes('Next Follow-up')
    );
    return block?.querySelector('.crm-add-creator-preview__meta-value')?.textContent?.trim();
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  console.log('1 initial:', await getPreview(page));

  // Date FIRST
  await page.getByRole('button', { name: 'Choose Next Follow-up date' }).click();
  await page.waitForTimeout(200);
  const day17 = page.locator('button.Polaris-DatePicker__Day').filter({ hasText: /^17$/ }).first();
  if (await day17.count()) await day17.click();
  await page.waitForTimeout(300);
  console.log('2 after date only:', await getPreview(page));

  // Then time
  const selects = page.locator('.crm-add-creator__reminder-time select');
  await selects.nth(0).selectOption('11');
  await selects.nth(1).selectOption('17');
  await selects.nth(2).selectOption('PM');
  await page.waitForTimeout(300);
  console.log('3 after date then time:', await getPreview(page));

  await browser.close();
}

main();
