# DevBox Deploy Guide — influencers-dashboard

Project: **influencers-dashboard**  
DevBox debug URL: `https://ysjunirzyaiy.sealoshzh.site`  
Production URL (App Launchpad): `https://nsorqcnhzezd.sealoshzh.site`

---

## Quick steps

### 1. Pull latest code in DevBox terminal

```bash
cd ~/project
git pull origin main
chmod +x entrypoint.sh
```

### 2. Test in DevBox (optional)

```bash
npm install
npm install --prefix client
export SHOPIFY_API_KEY=your_client_id
export HOST=nsorqcnhzezd.sealoshzh.site
npm run build
npm start
```

Open DevBox public debug URL and check logs for `Database connected successfully`.

### 3. Publish a new version

DevBox → **influencers-dashboard** → **版本历史** → **发布版本**

- Version: `v2` (or next number)
- Notes: `Shopify OAuth + App Bridge`

Wait until status is **发布成功**.

### 4. Deploy to App Launchpad

Click **上线** next to the new version → choose **update existing app**.

Configure:

| Setting | Value |
|---------|-------|
| Port | `3000` |
| Public URL | `https://nsorqcnhzezd.sealoshzh.site` |

Environment variables:

```env
DB_USER=postgres
DB_PASSWORD=...
DB_HOST=dbconn.sealoshzh.site
DB_PORT=44845
DB_NAME=postgres
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_SCOPES=read_products,read_orders,read_customers
HOST=nsorqcnhzezd.sealoshzh.site
NODE_ENV=production
```

Click **部署应用** and verify logs.

### 5. Database migration (once)

```sql
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS shop VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_influencers_shop ON influencers (shop);
```

### 6. Shopify Partner + install

See `SHOPIFY_INSTALL.md`.

- App URL: `https://nsorqcnhzezd.sealoshzh.site`
- Callback: `https://nsorqcnhzezd.sealoshzh.site/auth/callback`
- Test on dev store → install on company store

---

## Notes

- `entrypoint.sh` runs on every container start (install → build → start).
- `HOST` must match the **production** domain, not the DevBox debug URL.
- `SHOPIFY_API_KEY` must be set before `npm run build` (App Bridge meta tag).
