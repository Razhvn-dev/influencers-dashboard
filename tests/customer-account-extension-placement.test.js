const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const extensionToml = fs.readFileSync(path.join(root, 'extensions', 'creator-program', 'shopify.extension.toml'), 'utf8');
const extensionSource = fs.readFileSync(path.join(root, 'extensions', 'creator-program', 'src', 'CreatorProgram.jsx'), 'utf8');

test('Creator Program is a profile widget and uses the active production API', () => {
  assert.match(extensionToml, /target = "customer-account\.profile\.block\.render"/);
  assert.match(extensionSource, /https:\/\/osjgakhffqyk\.sealosbja\.site/);
  assert.doesNotMatch(extensionSource, /ejvhcshygemh\.sealosbja\.site/);
});

test('Creator Program distinguishes session-token failures from backend connection failures', () => {
  assert.match(extensionSource, /Unable to establish a secure customer account session/);
  assert.match(extensionSource, /Unable to reach the Creator Program service/);
});
