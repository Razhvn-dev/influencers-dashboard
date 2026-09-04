require('dotenv').config();
const compression = require('compression');
const express = require('express');
const net = require('net');
const path = require('path');
const fs = require('fs');

// Sealos currently has no working IPv6 path to the production Shopify shop.
// Select the reachable IPv4 address before Shopify initializes HTTP clients.
net.setDefaultAutoSelectFamily(false);

const { testConnection } = require('./db');
const { pool } = require('./db');
const shopify = require('./shopify');
const influencerRoutes = require('./routes/influencers');
const { renderExitIframePage } = require('./lib/exitiframe');
const { toCustomerAccountProfile } = require('./lib/customerAccountProfile');
const {
  normalizeCustomerAccountSubject,
  normalizeCustomerAccountDestination,
} = require('./lib/customerAccountToken');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const clientDist = path.join(__dirname, 'client', 'dist');
const isLocalDev = process.env.LOCAL_DEV === 'true';

function readFrontendBuildInfo() {
  try {
    const indexPath = path.join(clientDist, 'index.html');
    if (!fs.existsSync(indexPath)) return null;

    const html = fs.readFileSync(indexPath, 'utf8');
    const jsMatch = html.match(/assets\/(index-[^"]+\.js)/);
    const cssMatch = html.match(/assets\/(index-[^"]+\.css)/);

    return {
      js: jsMatch?.[1] || null,
      css: cssMatch?.[1] || null,
    };
  } catch {
    return null;
  }
}

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
app.use(compression({ threshold: 1024 }));
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

app.get('/api/version', (_req, res) => {
  res.json({
    ok: true,
    service: 'influencer-dashboard',
    commit: process.env.BUILD_GIT_SHA || null,
    builtAt: process.env.BUILD_TIME || null,
    frontend: readFrontendBuildInfo(),
  });
});

app.get('/api/config', (_req, res) => {
  res.json({
    success: true,
    apiKey: process.env.SHOPIFY_API_KEY,
  });
});

function getBearerToken(req) {
  const authorization = String(req.get('authorization') || '');
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
}

function readRuntimeIndexHtml(req) {
  const indexPath = path.join(clientDist, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  return html
    .replaceAll('__SHOPIFY_API_KEY__', process.env.SHOPIFY_API_KEY || '')
    .replaceAll('__SHOPIFY_HOST__', String(req.query.host || ''));
}

function getShopFromSessionToken(payload) {
  return normalizeCustomerAccountDestination(payload.dest);
}

function hasExpectedCustomerAccountAudience(payload) {
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  return audiences.includes(process.env.SHOPIFY_API_KEY);
}

function setCustomerAccountCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

app.options('/api/customer-account/creator-program', (_req, res) => {
  setCustomerAccountCors(res);
  res.sendStatus(204);
});

app.get('/api/customer-account/creator-program', async (req, res) => {
  try {
    setCustomerAccountCors(res);
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Customer account session token is required' });
    }

    // Customer Account session tokens are valid JWTs whose `aud` claim may be
    // represented as either a string or an array. Verify the signature and
    // expiry with Shopify's SDK, then enforce our API key against both forms.
    const payload = await shopify.api.session.decodeSessionToken(token, { checkAudience: false });
    const customerId = normalizeCustomerAccountSubject(payload.sub);
    const shop = getShopFromSessionToken(payload);

    const audienceMatched = hasExpectedCustomerAccountAudience(payload);
    if (!audienceMatched || !shop) {
      console.warn('Customer account token claims did not match this app', {
        audienceMatched,
        destinationHost: shop,
        destinationClaimType: Array.isArray(payload.dest) ? 'array' : typeof payload.dest,
        hasCustomerSubject: Boolean(customerId),
      });
      return res.status(401).json({ success: false, message: 'Customer account session is invalid' });
    }

    if (!customerId) {
      return res.status(403).json({
        success: false,
        message: 'Customer identity is unavailable in this account session',
      });
    }

    const result = await pool.query(
      `
        SELECT business_name, first_name, last_name, channel, status,
               affiliate_code, commission, niche_category, bio
        FROM influencers
        WHERE shop = $1
          AND shopify_customer_id = $2
          AND customer_account_visible = TRUE
        LIMIT 1
      `,
      [shop, customerId]
    );

    res.json({
      success: true,
      data: result.rowCount ? toCustomerAccountProfile(result.rows[0]) : null,
    });
  } catch (err) {
    console.error('Failed to fetch customer account creator program:', err.message);
    res.status(401).json({ success: false, message: 'Customer account session is invalid' });
  }
});

if (isLocalDev) {
  app.use('/api/influencers', injectLocalDevSession, influencerRoutes);
} else {
  const validateSession = shopify.validateAuthenticatedSession();
  app.use('/api/influencers', (req, res, next) => {
    validateSession(req, res, (err) => {
      if (err) {
        console.error('Session validation failed:', err?.message || err);
        if (!res.headersSent) {
          res.status(401).json({
            success: false,
            message: 'Session validation failed. Please refresh the page and try again.',
          });
        }
        return;
      }

      if (!res.headersSent) {
        next();
      }
    });
  }, influencerRoutes);
}

app.use((err, _req, res, next) => {
  console.error('Unhandled server error:', err.message);
  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

if (fs.existsSync(clientDist)) {
  // Do not serve index.html from static middleware — runtime values must be
  // injected before returning the shell. The API routes validate Shopify session
  // tokens independently; running ensureInstalledOnShop here can block an
  // already-installed embedded app before its frontend is allowed to load.
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return;
        }

        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  app.use('/*', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const html = readRuntimeIndexHtml(req);
    res.type('html').send(html);
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
