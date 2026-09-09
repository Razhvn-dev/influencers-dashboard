-- Keep the staff list responsive as each shop's creator dataset grows.
CREATE INDEX IF NOT EXISTS idx_influencers_shop_status
  ON influencers (shop, status);

CREATE INDEX IF NOT EXISTS idx_influencers_shop_next_followup_at
  ON influencers (shop, next_followup_at);
