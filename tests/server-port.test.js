const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const test = require('node:test');

const port = 3107;

function requestHealth() {
  return new Promise((resolve, reject) => {
    const request = http.get(`http://127.0.0.1:${port}/health`, (response) => {
      response.resume();
      resolve(response.statusCode);
    });
    request.on('error', reject);
  });
}

test('server listens on the PORT supplied by Shopify CLI', async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'test',
      TEST_SKIP_DB_CONNECTION: 'true',
      SHOPIFY_API_KEY: 'test-api-key',
      SHOPIFY_API_SECRET: 'test-api-secret',
      HOST: 'localhost',
      DB_USER: 'postgres',
      DB_PASSWORD: 'test-password',
      DB_HOST: '127.0.0.1',
      DB_NAME: 'postgres',
    },
    stdio: 'ignore',
  });

  try {
    let statusCode;
    let lastError;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        statusCode = await requestHealth();
        break;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    assert.equal(statusCode, 200, lastError?.message);
  } finally {
    server.kill();
  }
});
