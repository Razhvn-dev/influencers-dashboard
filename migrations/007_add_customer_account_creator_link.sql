ALTER TABLE influencers ADD COLUMN IF NOT EXISTS shopify_customer_id TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS customer_account_visible BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_influencers_shopify_customer_link
  ON influencers (shop, shopify_customer_id)
  WHERE shopify_customer_id IS NOT NULL;

COMMENT ON COLUMN influencers.shopify_customer_id IS 'Shopify Customer GID allowed to view this creator program profile';
COMMENT ON COLUMN influencers.customer_account_visible IS 'Whether the linked customer can view the customer account creator program profile';
