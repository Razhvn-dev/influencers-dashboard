ALTER TABLE influencers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS last_name TEXT;

COMMENT ON COLUMN influencers.business_name IS 'Primary business or channel identity for a creator';
COMMENT ON COLUMN influencers.first_name IS 'Creator first name';
COMMENT ON COLUMN influencers.last_name IS 'Creator last name';
