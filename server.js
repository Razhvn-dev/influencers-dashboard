require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./db');
const shopify = require('./shopify');
const influencerRoutes = require('./routes/influencers');
const { renderExitIframePage } = require('./lib/exitiframe');

const app = express();
const PORT = 3000;
const clientDist = path.join(__dirname, 'client', 'dist');
const isLocalDev = process.env.LOCAL_DEV === 'true';

function injectLocalDevSession(_req, res, next) {
  res.locals.shopify = {
    session: {
      shop: process.env.LOCAL_DEV_SHOP || 'acesefi.myshopify.com',
    },
  };
  next();
}

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

app.get(shopify.config.exitIframePath, (req, res) => {
  res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(renderExitIframePage(process.env.SHOPIFY_API_KEY || ''));
});

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

if (isLocalDev) {
  app.use('/api/influencers', injectLocalDevSession, influencerRoutes);
} else {
  app.use(
    '/api/influencers',
    shopify.validateAuthenticatedSession(),
    influencerRoutes
  );
}

if (fs.existsSync(clientDist)) {
  // Do not serve index.html from static middleware — ensureInstalledOnShop must
  // run first so the install/OAuth flow is not skipped on the first request to /.
  app.use(express.static(clientDist, { index: false }));

  app.use('/*', shopify.ensureInstalledOnShop(), (_req, res) => {
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

      if (isLocalDev) {
        console.log(
          `LOCAL_DEV enabled — API uses shop: ${process.env.LOCAL_DEV_SHOP || 'acesefi.myshopify.com'}`
        );
        console.log('Open http://localhost:5173 in your browser to preview the app.');
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
