-- Run once on existing databases that were created before Shopify integration
ALTER TABLE influencers
  ADD COLUMN IF NOT EXISTS shop VARCHAR(255);

UPDATE influencers
SET shop = 'legacy-shop.myshopify.com'
WHERE shop IS NULL;

ALTER TABLE influencers
  ALTER COLUMN shop SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_influencers_shop ON influencers (shop);
