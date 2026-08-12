import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

const artifactDirectory =
  process.env.ARTIFACT_DIR || 'C:/Users/Administrator/Desktop/influencers/artifacts/add-creator-polish-v2';

async function main() {
  await mkdir(artifactDirectory, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(`${baseUrl}/creators/new`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('.crm-add-creator-v2__container', { timeout: 30000 });
    await page.waitForTimeout(800);

    const metrics = await page.evaluate(() => {
      const container = document.querySelector('.crm-add-creator-v2__container');
      const pageContent = document.querySelector('.Polaris-Page__Content');
      const title = document.querySelector('.crm-add-creator__title');
      const card = document.querySelector('.crm-add-creator__card');
      const banner = document.querySelector('.crm-add-creator__info-banner');
      const profileIntro = document.querySelector('.crm-add-creator__profile-intro');
      const platformSummary = document.querySelector('.crm-platform-summary');
      const platformTable = document.querySelector('.crm-add-creator__platform-table');
      return {
        hasContainer: Boolean(container),
        hasBasicCard: Boolean(document.querySelector('.crm-add-creator__basic-card')),
        hasPreview: Boolean(document.querySelector('.crm-creator-preview')),
        hasInfoBanner: Boolean(banner),
        hasProfileIntro: Boolean(profileIntro),
        hasPlatformSummary: Boolean(platformSummary),
        hasPlatformTable: Boolean(platformTable),
        titleFontSize: title ? getComputedStyle(title).fontSize : null,
        pageBg: pageContent ? getComputedStyle(pageContent).backgroundColor : null,
        cardRadius: card ? getComputedStyle(card).borderRadius : null,
        bodyFont: getComputedStyle(document.body).fontFamily,
      };
    });

    if (!metrics.hasContainer || !metrics.hasBasicCard || !metrics.hasPreview) {
      throw new Error('Add creator page missing key sections');
    }

    if (metrics.hasInfoBanner || metrics.hasProfileIntro || metrics.hasPlatformSummary) {
      throw new Error('Legacy UI blocks still present on add creator page');
    }

    if (!metrics.hasPlatformTable) {
      throw new Error('Compact platform table missing');
    }

    const titleSize = Number.parseFloat(metrics.titleFontSize || '0');
    const cardRadius = Number.parseFloat(metrics.cardRadius || '0');
    if (titleSize > 21 || cardRadius < 14) {
      throw new Error(
        `Visual tokens mismatch: title=${metrics.titleFontSize}, cardRadius=${metrics.cardRadius}`
      );
    }

    const screenshotPath = `${artifactDirectory}/add-creator-polish-v2-1440.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await page.setViewportSize({ width: 390, height: 1200 });
    await page.waitForTimeout(400);
    const mobileMetrics = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    if (mobileMetrics.scrollWidth > mobileMetrics.viewport) {
      throw new Error(`Add Creator overflows at 390px (${mobileMetrics.scrollWidth}px > ${mobileMetrics.viewport}px)`);
    }
    const mobileScreenshotPath = `${artifactDirectory}/add-creator-polish-v2-390.png`;
    await page.screenshot({ path: mobileScreenshotPath, fullPage: true });

    console.log(
      JSON.stringify({ status: 'passed', screenshotPath, mobileScreenshotPath, metrics, mobileMetrics }, null, 2)
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
