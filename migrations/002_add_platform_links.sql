-- Add social platform profile links (Phase 1 requirement)
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500);
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500);
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500);
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500);

COMMENT ON COLUMN influencers.youtube_url IS 'YouTube channel or profile URL';
COMMENT ON COLUMN influencers.facebook_url IS 'Facebook page or profile URL';
COMMENT ON COLUMN influencers.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN influencers.tiktok_url IS 'TikTok profile URL';
