import { chromium } from 'playwright';

const url = 'http://localhost:5173/creators/new';

async function getPreviewFollowup(page) {
  return page.evaluate(() => {
    const blocks = [...document.querySelectorAll('.crm-add-creator-preview__meta-block')];
    const block = blocks.find((el) => el.textContent?.includes('Next Follow-up'));
    return block?.querySelector('.crm-add-creator-preview__meta-value')?.textContent?.trim() ?? null;
  });
}

async function getFormFollowup(page) {
  return page.evaluate(() => window.__crmGetFollowup?.() ?? 'no hook');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const t = msg.text();
    if (t.includes('crm') || t.includes('followup') || t.includes('Followup')) console.log('[browser]', t);
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  // Change hour select - find selects in reminder time area
  const selects = page.locator('.crm-add-creator__reminder-time select');
  const count = await selects.count();
  console.log('select count:', count);

  if (count >= 3) {
    await selects.nth(0).selectOption('11');
    await page.waitForTimeout(200);
    console.log('after hour:', await getPreviewFollowup(page));

    await selects.nth(1).selectOption('17');
    await page.waitForTimeout(200);
    console.log('after minute:', await getPreviewFollowup(page));

    await selects.nth(2).selectOption('PM');
    await page.waitForTimeout(200);
    console.log('after PM:', await getPreviewFollowup(page));
  } else {
    // Polaris might use button+listbox instead of native select
    const polarisSelects = page.locator('.crm-add-creator__reminder-time .Polaris-Select select');
    console.log('polaris select count:', await polarisSelects.count());
  }

  // Open date picker and click a day
  await page.locator('button[aria-label="Choose Next Follow-up date"]').click();
  await page.waitForTimeout(300);

  const dayButton = page.locator('button.Polaris-DatePicker__Day').filter({ hasText: /^17$/ }).first();
  if (await dayButton.count()) {
    await dayButton.click();
    await page.waitForTimeout(300);
    console.log('after date pick:', await getPreviewFollowup(page));
  } else {
    const anyDay = page.locator('button.Polaris-DatePicker__Day:not([aria-disabled="true"])').nth(10);
    if (await anyDay.count()) {
      await anyDay.click();
      await page.waitForTimeout(300);
      console.log('after any day pick:', await getPreviewFollowup(page));
    }
  }

  const dateInput = await page.locator('input[placeholder="Select date"]').inputValue();
  console.log('date input:', dateInput);
  console.log('final preview:', await getPreviewFollowup(page));

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
