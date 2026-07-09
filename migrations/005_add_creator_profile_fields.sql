-- Extended creator profile fields used on Add Creator / Detail pages

ALTER TABLE influencers ADD COLUMN IF NOT EXISTS niche_category TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS manager_owner VARCHAR(255);
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

COMMENT ON COLUMN influencers.niche_category IS 'Creator niche or category label';
COMMENT ON COLUMN influencers.bio IS 'Short creator biography';
COMMENT ON COLUMN influencers.tags IS 'Comma-separated internal tags';
COMMENT ON COLUMN influencers.manager_owner IS 'Internal manager or owner label';
COMMENT ON COLUMN influencers.created_at IS 'When the creator record was first created';
COMMENT ON COLUMN influencers.updated_at IS 'When the creator record was last updated';
