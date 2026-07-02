require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./db');
const shopify = require('./shopify');
const influencerRoutes = require('./routes/influencers');

const app = express();
const PORT = 3000;
const clientDist = path.join(__dirname, 'client', 'dist');

const authBegin = shopify.auth.begin();
const authCallback = shopify.auth.callback();
const redirectAfterAuth = shopify.redirectToShopifyOrAppRoot();

app.set('trust proxy', true);
app.use(express.json());
app.use(shopify.cspHeaders());

app.get(shopify.config.auth.path, authBegin);
app.get(shopify.config.auth.callbackPath, authCallback, redirectAfterAuth);

app.get('/auth', authBegin);
app.get('/auth/callback', authCallback, redirectAfterAuth);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: {} })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'influencer-dashboard' });
});

app.get('/api/config', (_req, res) => {
  res.json({
    success: true,
    apiKey: process.env.SHOPIFY_API_KEY,
  });
});

app.use(
  '/api/influencers',
  shopify.validateAuthenticatedSession(),
  influencerRoutes
);

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get(/^(?!\/api).*/, shopify.ensureInstalledOnShop(), (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.status(503).send('Frontend build not found. Run npm run build first.');
  });
}

async function startServer() {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(
        `Shopify auth callback: https://${shopify.api.config.hostName}${shopify.config.auth.callbackPath}`
      );
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
