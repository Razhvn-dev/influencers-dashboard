import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const styles = await readFile(
  new URL('../src/styles/add-creator.css', import.meta.url),
  'utf8'
);

const tabletLayout = styles.lastIndexOf('@media (max-width: 1100px)');
const finalMobileLayout = styles.lastIndexOf(
  '.crm-add-creator-v2 .crm-add-creator__layout {\n    grid-template-columns: 1fr !important;'
);

assert.ok(tabletLayout >= 0, 'The tablet two-column refinement must remain defined.');
assert.ok(
  finalMobileLayout > tabletLayout,
  'A final max-width: 900px override must follow the tablet layout declaration.'
);

const finalMobileBlock = styles.slice(finalMobileLayout, styles.indexOf('}', styles.indexOf('.crm-add-creator-v2 .crm-add-creator__preview-column', finalMobileLayout)) + 1);
assert.match(
  finalMobileBlock,
  /\.crm-add-creator-v2 \.crm-add-creator__layout\s*\{\s*grid-template-columns:\s*1fr !important;/s,
  'Tablet and mobile layouts must collapse to a single column.'
);
assert.match(
  finalMobileBlock,
  /\.crm-add-creator-v2 \.crm-add-creator__preview-column\s*\{\s*position:\s*static;\s*\}/s,
  'The preview must return to document flow on tablet and mobile.'
);

console.log('Add Creator responsive layout contract passed.');
