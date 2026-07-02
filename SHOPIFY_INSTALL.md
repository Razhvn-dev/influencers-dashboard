# Shopify App Installation Guide

Follow these steps after deploying the latest code to Sealos.

## 1. Update Sealos environment variables

Add or confirm these variables in your Sealos app settings:

```env
DB_USER=postgres
DB_PASSWORD=...
DB_HOST=...
DB_PORT=5432
DB_NAME=postgres

SHOPIFY_API_KEY=your_client_id
SHOPIFY_API_SECRET=your_client_secret
SHOPIFY_SCOPES=read_products,read_orders,read_customers
HOST=nsorqcnhzezd.sealoshzh.site
```

`HOST` must be your public app hostname **without** `https://`.

## 2. Run database migration (existing databases only)

If the database was created before Shopify integration, run:

```sql
-- migrations/001_add_shop_column.sql
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS shop VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_influencers_shop ON influencers (shop);
```

Shopify session tables are created automatically by the session storage adapter.

## 3. Configure Shopify Partner Dashboard

Open your app in [Shopify Partners](https://partners.shopify.com) and set:

| Setting | Value |
|---------|-------|
| App URL | `https://nsorqcnhzezd.sealoshzh.site` |
| Allowed redirection URL(s) | `https://nsorqcnhzezd.sealoshzh.site/api/auth/callback` |
| Embedded app | **Enabled** |
| App type | Custom app (internal use) |

## 4. Redeploy on Sealos

Push the latest code to GitHub and trigger a new deployment on Sealos.

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

## 5. Install on a development store first

1. In Partner Dashboard, open your app.
2. Click **Test on development store** (or choose a dev store).
3. Approve the requested permissions.
4. Open **Apps** in Shopify Admin and launch **Influencer Dashboard**.

## 6. Install on your company store

After testing:

1. Partner Dashboard → **Select store** → choose your production store.
2. Complete OAuth authorization.
3. Your US team opens the app from **Shopify Admin → Apps**.

## 7. Direct install link (optional)

Replace placeholders and open in a browser while logged into the target store admin:

```
https://YOUR-STORE.myshopify.com/admin/oauth/authorize?client_id=YOUR_SHOPIFY_API_KEY&scope=read_products,read_orders,read_customers&redirect_uri=https://nsorqcnhzezd.sealoshzh.site/api/auth/callback
```

## Notes

- The app is no longer publicly accessible without Shopify authentication.
- Influencer records are scoped per shop (`shop` column).
- Old records without a `shop` value will not appear until updated for the installed store.
