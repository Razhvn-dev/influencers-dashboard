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

  const compressionSetup = server.indexOf('app.use(compression(');
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
