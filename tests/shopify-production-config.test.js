const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('production Shopify configuration targets a supported API version', () => {
  const appConfig = read('shopify.app.toml');
  const runtimeConfig = read('shopify.js');

  assert.match(appConfig, /api_version\s*=\s*"2026-01"/);
  assert.match(runtimeConfig, /apiVersion:\s*ApiVersion\.January26/);
});

test('server startup disables automatic IPv6 selection before Shopify clients initialize', () => {
  const server = read('server.js');
  const networkSetup = server.indexOf("net.setDefaultAutoSelectFamily(false)");
  const shopifyImport = server.indexOf("require('./shopify')");

  assert.ok(networkSetup >= 0, 'server startup must prefer the reachable IPv4 path');
  assert.ok(networkSetup < shopifyImport, 'network setup must run before Shopify initializes its HTTP clients');
});

test('production app URL and OAuth callbacks use the Sealos deployment host', () => {
  const appConfig = read('shopify.app.toml');
  const host = 'https://osjgakhffqyk.sealosbja.site';

  assert.match(appConfig, new RegExp(`application_url\\s*=\\s*"${host}"`));
  assert.match(appConfig, new RegExp(`${host}/api/auth/callback`));
  assert.match(appConfig, new RegExp(`${host}/auth/callback`));
});

test('the environment template cannot enable local authentication bypass by default', () => {
  const envTemplate = read('.env.example');

  assert.doesNotMatch(envTemplate, /^LOCAL_DEV=true$/m);
  assert.doesNotMatch(envTemplate, /^LOCAL_DEV_SHOP=/m);
});

test('client production dependencies avoid known high-severity versions', () => {
  const clientPackage = JSON.parse(read('client/package.json'));

  assert.equal(clientPackage.dependencies['react-router-dom'], '^7.18.2');
  assert.equal(clientPackage.devDependencies.postcss, '^8.5.26');
  assert.match(clientPackage.devDependencies.nanoid, /^\^3\.3\.(?:1[7-9]|[2-9]\d)$/);
});

test('production image includes and can run the database migration bundle', () => {
  const dockerfile = read('Dockerfile');
  const serverPackage = JSON.parse(read('package.json'));

  assert.match(dockerfile, /COPY init\.sql \.\/init\.sql/);
  assert.match(dockerfile, /COPY migrations \.\/migrations/);
  assert.match(dockerfile, /COPY scripts\/run-migrations\.mjs \.\/scripts\/run-migrations\.mjs/);
  assert.equal(serverPackage.scripts.migrate, 'node scripts/run-migrations.mjs');
});

test('base database schema can be safely reapplied before incremental migrations', () => {
  const initSql = read('init.sql');

  assert.match(initSql, /CREATE TABLE IF NOT EXISTS influencers/i);
  assert.match(initSql, /CREATE INDEX IF NOT EXISTS idx_influencers_shop/i);
});

test('Vite QA can target an explicit temporary API server', () => {
  const viteConfig = read('client/vite.config.js');
  const qaConfig = read('client/scripts/qa-config.mjs');

  assert.match(viteConfig, /API_PROXY_TARGET/);
  assert.match(viteConfig, /target:\s*apiProxyTarget/);
  assert.match(qaConfig, /http:\/\/localhost:5173/);
});
