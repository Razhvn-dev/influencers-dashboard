import { chromium } from 'playwright';

const url = 'http://localhost:5173/creators/new';

async function getPreviewFollowup(page) {
  return page.evaluate(() => {
    const blocks = [...document.querySelectorAll('.crm-add-creator-preview__meta-block')];
    const block = blocks.find((el) => el.textContent?.includes('Next Follow-up'));
    const valueEl = block?.querySelector('.crm-add-creator-preview__meta-value');
    return valueEl?.textContent?.trim() ?? null;
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  console.log('initial:', await getPreviewFollowup(page));

  await page.evaluate(() => {
    window.__crmSetFollowup?.('2026-07-17T23:17');
  });
  await page.waitForTimeout(300);

  const after = await getPreviewFollowup(page);
  console.log('after programmatic set:', after);

  if (after !== 'Jul 17, 2026, 11:17 PM') {
    throw new Error(`Expected formatted preview, got: ${after}`);
  }

  await browser.close();
  console.log('PASS preview updates when form state changes');
}

main().catch((err) => {
  console.error('FAIL', err.message);
  process.exit(1);
});
