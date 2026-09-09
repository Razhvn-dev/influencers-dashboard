const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const routeSource = fs.readFileSync(path.join(root, 'routes', 'influencers.js'), 'utf8');
const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const detailSource = fs.readFileSync(path.join(root, 'client', 'src', 'pages', 'CreatorDetailPage.jsx'), 'utf8');
const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf8');
const dockerPushScript = fs.readFileSync(path.join(root, 'scripts', 'docker-push.ps1'), 'utf8');

test('updates a creator and customer-account link in one transaction', () => {
  assert.match(routeSource, /const customerAccountLink = normalizeCustomerAccountLink\(req\.body, existing\)/);
  assert.match(routeSource, /shopify_customer_id = \$34,\s*customer_account_visible = \$35/);
  assert.match(detailSource, /await updateSponsorshipRecord\(record\.id, buildSavePayload\(form\)\)/);
  assert.doesNotMatch(detailSource, /await updateCustomerAccountLink\(/);
});

test('paginates creator lists in PostgreSQL and returns a total', () => {
  assert.match(routeSource, /SELECT COUNT\(\*\)::INT AS total/);
  assert.match(routeSource, /LIMIT \$\$\{queryValues\.length - 1\} OFFSET \$\$\{queryValues\.length\}/);
  assert.match(routeSource, /pagination:\s*\{\s*page,/);
});

test('hardens HTTP defaults and embeds image build provenance', () => {
  assert.match(serverSource, /app\.disable\('x-powered-by'\)/);
  assert.match(serverSource, /express\.json\(\{ limit: '1mb' \}\)/);
  assert.doesNotMatch(serverSource, /app\.get\('\/api\/config'/);
  assert.match(dockerfile, /ARG BUILD_GIT_SHA/);
  assert.match(dockerfile, /ENV BUILD_GIT_SHA=\$BUILD_GIT_SHA/);
  assert.match(dockerPushScript, /--build-arg BUILD_GIT_SHA=/);
  assert.match(dockerPushScript, /--build-arg BUILD_TIME=/);
});
