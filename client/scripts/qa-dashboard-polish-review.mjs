import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

const artifactDirectory = process.env.ARTIFACT_DIR || 'C:/Users/Administrator/Desktop/influencers/artifacts/dashboard-polish-v4';

async function main() {
  await mkdir(artifactDirectory, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });

    if (!response?.ok()) {
      throw new Error(`Dashboard failed to load (${response?.status() ?? 'no response'})`);
    }

    await page.waitForSelector('.crm-dashboard-v2', { timeout: 30000 });
    await page.waitForTimeout(800);

    const metrics = await page.evaluate(() => {
      const title = document.querySelector('.crm-v2-header__title');
      const kpiValue = document.querySelector('.crm-kpi-card__value');
      const shell = document.querySelector('.crm-dashboard-v2__shell');
      const titleStyle = title ? getComputedStyle(title) : null;
      const kpiStyle = kpiValue ? getComputedStyle(kpiValue) : null;
      const shellStyle = shell ? getComputedStyle(shell) : null;
      const bodyStyle = getComputedStyle(document.body);

      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        titleFontSize: titleStyle?.fontSize ?? null,
        kpiFontSize: kpiStyle?.fontSize ?? null,
        shellRadius: shellStyle?.borderRadius ?? null,
        bodyFont: bodyStyle.fontFamily,
        hasOverview: Boolean(document.querySelector('.crm-dashboard-v2__metrics-wrap')),
        hasTable: Boolean(document.querySelector('.crm-v2-table')),
      };
    });

    if (metrics.scrollWidth > metrics.viewport) {
      throw new Error(`Dashboard overflows horizontally (${metrics.scrollWidth}px > ${metrics.viewport}px)`);
    }

    if (!metrics.hasOverview || !metrics.hasTable) {
      throw new Error('Dashboard is missing overview or table sections');
    }

    const screenshotPath = `${artifactDirectory}/dashboard-polish-v4-1440.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(JSON.stringify({ status: 'passed', screenshotPath, metrics }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
