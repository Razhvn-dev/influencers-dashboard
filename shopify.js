require('dotenv').config();
const { shopifyApp } = require('@shopify/shopify-app-express');
const {
  PostgreSQLSessionStorage,
} = require('@shopify/shopify-app-session-storage-postgresql');
const { ApiVersion } = require('@shopify/shopify-api');

function getHostName() {
  const raw = process.env.HOST || process.env.SHOPIFY_APP_URL || 'localhost';
  return raw.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function getDatabaseUrl() {
  const user = encodeURIComponent(process.env.DB_USER);
  const password = encodeURIComponent(process.env.DB_PASSWORD);
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT) || 5432;
  const database = encodeURIComponent(process.env.DB_NAME);

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: (process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers')
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean),
    hostName: getHostName(),
    apiVersion: ApiVersion.October24,
    isEmbeddedApp: true,
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/webhooks',
  },
  sessionStorage: new PostgreSQLSessionStorage(getDatabaseUrl()),
});

module.exports = shopify;
