-- Track manual follower count verification (no API syncing)

ALTER TABLE influencers ADD COLUMN IF NOT EXISTS followers_last_verified_at TIMESTAMPTZ;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS followers_verified_by VARCHAR(255);

COMMENT ON COLUMN influencers.followers_last_verified_at IS 'Timestamp when follower/subscriber counts were last manually updated and saved';
COMMENT ON COLUMN influencers.followers_verified_by IS 'Shopify staff label recorded when follower counts were last verified';
