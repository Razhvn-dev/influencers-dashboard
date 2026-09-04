const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('production compresses JavaScript and CSS responses before static delivery', () => {
  const packageJson = JSON.parse(read('package.json'));
  const server = read('server.js');

  assert.equal(packageJson.dependencies.compression, '^1.8.1');
  assert.match(server, /const compression = require\('compression'\);/);

  const compressionSetup = server.search(/app\.use\(\s*compression\(/);
  const staticSetup = server.indexOf('express.static(clientDist');

  assert.ok(compressionSetup >= 0, 'compression middleware must be registered');
  assert.ok(
    compressionSetup < staticSetup,
    'compression middleware must run before static asset delivery'
  );
});

test('hashed frontend assets are immutable while HTML remains non-cacheable', () => {
  const server = read('server.js');

  assert.ok(
    server.includes('filePath.includes(`${path.sep}assets${path.sep}`)'),
    'cache policy must be limited to the Vite assets directory'
  );
  assert.match(server, /public, max-age=31536000, immutable/);
  assert.match(server, /no-cache, no-store, must-revalidate/);
});

test('frontend avoids multiplying startup requests on the embedded app origin', () => {
  const viteConfig = read('client/vite.config.js');

  assert.doesNotMatch(viteConfig, /manualChunks\(id\)/);
});

test('production serves compressed Vite assets with a fixed content length', () => {
  const server = read('server.js');

  assert.match(server, /const zlib = require\('zlib'\);/);
  assert.match(server, /app\.get\('\/assets\/:file'/);
  assert.match(server, /zlib\.brotliCompressSync/);
  assert.match(server, /zlib\.gzipSync/);
  assert.match(server, /Content-Encoding/);
  assert.match(server, /Content-Length/);

  const bufferedAssetRoute = server.indexOf("app.get('/assets/:file'");
  const compressionSetup = server.search(/app\.use\(\s*compression\(/);
  assert.ok(
    bufferedAssetRoute >= 0 && bufferedAssetRoute < compressionSetup,
    'buffered assets must bypass streaming compression'
  );
});

test('small runtime HTML is not converted into a chunked compressed stream', () => {
  const server = read('server.js');

  assert.match(server, /contentType\.startsWith\('text\/html'\)/);
  assert.match(server, /return false;/);
});
