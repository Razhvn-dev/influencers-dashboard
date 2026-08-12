import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { baseUrl, chromePath } from './qa-config.mjs';

const artifactDirectory =
  process.env.ARTIFACT_DIR || 'C:/Users/Administrator/Desktop/influencers/artifacts/dashboard-v6-review';

async function main() {
  await mkdir(artifactDirectory, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('.crm-dashboard-v2', { timeout: 30000 });
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate(() => {
      const filterLabels = [...document.querySelectorAll('.crm-v2-toolbar-popover-select > .Polaris-Text--root')];
      const table = document.querySelector('.crm-v2-table .Polaris-IndexTable__Table');
      const headings = [...document.querySelectorAll('.crm-v2-table .Polaris-IndexTable__TableHeading')].map(
        (node) => node.textContent?.trim() || ''
      );
      const firstRowCells = [...document.querySelectorAll('.crm-v2-table .crm-creator-resource-row .Polaris-IndexTable__TableCell')];
      const headingRects = [...document.querySelectorAll('.crm-v2-table .Polaris-IndexTable__TableHeading')].map(
        (node) => node.getBoundingClientRect().width
      );
      const cellRects = firstRowCells.map((node) => node.getBoundingClientRect().width);

      return {
        visibleFilterLabels: filterLabels.filter((node) => node.offsetParent !== null).length,
        tableLayout: table ? getComputedStyle(table).tableLayout : null,
        headings,
        headingWidths: headingRects,
        cellWidths: cellRects,
        hasRows: firstRowCells.length > 0,
      };
    });

    if (metrics.visibleFilterLabels > 0) {
      throw new Error(`Expected filter labels hidden, found ${metrics.visibleFilterLabels}`);
    }

    if (metrics.hasRows && metrics.headingWidths.length === metrics.cellWidths.length) {
      const mismatches = metrics.headingWidths.filter(
        (width, index) => Math.abs(width - metrics.cellWidths[index]) > 2
      ).length;
      if (mismatches > 2) {
        throw new Error(`Table column widths misaligned (${mismatches} mismatches)`);
      }
    }

    const filterPath = `${artifactDirectory}/dashboard-v6-filters-1440.png`;
    const tablePath = `${artifactDirectory}/dashboard-v6-table-1440.png`;

    await page.locator('.crm-v2-toolbar').screenshot({ path: filterPath });
    await page.locator('.crm-v2-table').screenshot({ path: tablePath });

    console.log(
      JSON.stringify({ status: 'passed', filterPath, tablePath, metrics }, null, 2)
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
