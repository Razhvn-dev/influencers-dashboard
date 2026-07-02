-- Align database with Sponsorship Progress Tracking spreadsheet

ALTER TABLE influencers ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS sponsored_products TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(100);
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS commission VARCHAR(10);
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS order_numbers TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS required_deliverables TEXT;

UPDATE influencers SET channel = company_name WHERE channel IS NULL AND company_name IS NOT NULL;
UPDATE influencers SET sponsored_products = products_requested
  WHERE sponsored_products IS NULL AND products_requested IS NOT NULL;
UPDATE influencers SET required_deliverables = deliverables
  WHERE required_deliverables IS NULL AND deliverables IS NOT NULL;

CREATE TABLE IF NOT EXISTS influencer_monthly_progress (
    id                  BIGSERIAL       PRIMARY KEY,
    influencer_id       BIGINT          NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
    shop                VARCHAR(255)    NOT NULL,
    period_index        SMALLINT        NOT NULL CHECK (period_index BETWEEN 1 AND 5),
    monthly_check_in    VARCHAR(50),
    content_delivered   TEXT,
    link                TEXT,
    UNIQUE (influencer_id, period_index)
);

CREATE INDEX IF NOT EXISTS idx_monthly_progress_shop ON influencer_monthly_progress (shop);
CREATE INDEX IF NOT EXISTS idx_monthly_progress_influencer ON influencer_monthly_progress (influencer_id);

COMMENT ON TABLE influencer_monthly_progress IS 'Monthly sponsorship check-in and content delivery tracking (matches spreadsheet columns)';
COMMENT ON COLUMN influencers.channel IS 'Creator channel or social profile (Channel column)';
COMMENT ON COLUMN influencers.sponsored_products IS 'Sponsored Product(s) column';
COMMENT ON COLUMN influencers.affiliate_code IS 'Affiliate Code column';
COMMENT ON COLUMN influencers.commission IS 'Commission column (YES/NO)';
COMMENT ON COLUMN influencers.order_numbers IS 'Order numbers column';
COMMENT ON COLUMN influencers.required_deliverables IS 'Required Deliverables per contract column';
