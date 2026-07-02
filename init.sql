-- Influencer Dashboard: core CRM table for managing creator partnerships
CREATE TABLE influencers (
    id                      BIGSERIAL       PRIMARY KEY,                          -- Unique auto-increment identifier
    shop                    VARCHAR(255)    NOT NULL,                             -- Shopify shop domain (e.g. mystore.myshopify.com)
    name                    VARCHAR(255)    NOT NULL,                             -- Influencer full name
    company_name            VARCHAR(255),                                        -- Company or channel name
    email                   VARCHAR(255),                                        -- Primary contact email
    region                  VARCHAR(100),                                        -- Country or geographic region
    status                  VARCHAR(50)     NOT NULL DEFAULT 'Contacted',         -- Partnership status (e.g. Contacted, Approved, Partnered)
    notes                   TEXT,                                                -- Internal notes and communication history

    youtube_followers       INTEGER         NOT NULL DEFAULT 0,                   -- YouTube subscriber count
    facebook_followers      INTEGER         NOT NULL DEFAULT 0,                   -- Facebook follower count
    instagram_followers     INTEGER         NOT NULL DEFAULT 0,                   -- Instagram follower count
    tiktok_followers        INTEGER         NOT NULL DEFAULT 0,                   -- TikTok follower count
    total_followers         INTEGER         NOT NULL DEFAULT 0,                   -- Aggregated follower count across platforms

    ambassador_level        VARCHAR(50),                                         -- Ambassador tier (e.g. 'Level 1', 'Level 2')

    contract_status         TEXT,                                                -- Current contract or agreement status
    products_requested      TEXT,                                                -- Products the influencer has requested
    deliverables            TEXT,                                                -- Expected or completed deliverables
    last_contacted_at       TIMESTAMPTZ,                                         -- Timestamp of the most recent outreach
    next_followup_at        TIMESTAMPTZ                                          -- Scheduled timestamp for the next follow-up
);

CREATE INDEX idx_influencers_shop ON influencers (shop);

COMMENT ON TABLE influencers IS 'CRM records for Shopify influencer / creator partnerships';

COMMENT ON COLUMN influencers.shop IS 'Shopify shop domain that owns this record';

COMMENT ON COLUMN influencers.id IS 'Unique auto-increment identifier';
COMMENT ON COLUMN influencers.name IS 'Influencer full name';
COMMENT ON COLUMN influencers.company_name IS 'Company or channel name';
COMMENT ON COLUMN influencers.email IS 'Primary contact email';
COMMENT ON COLUMN influencers.region IS 'Country or geographic region';
COMMENT ON COLUMN influencers.status IS 'Partnership status (e.g. Contacted, Approved, Partnered)';
COMMENT ON COLUMN influencers.notes IS 'Internal notes and communication history';
COMMENT ON COLUMN influencers.youtube_followers IS 'YouTube subscriber count';
COMMENT ON COLUMN influencers.facebook_followers IS 'Facebook follower count';
COMMENT ON COLUMN influencers.instagram_followers IS 'Instagram follower count';
COMMENT ON COLUMN influencers.tiktok_followers IS 'TikTok follower count';
COMMENT ON COLUMN influencers.total_followers IS 'Aggregated follower count across platforms';
COMMENT ON COLUMN influencers.ambassador_level IS 'Ambassador tier (e.g. Level 1, Level 2)';
COMMENT ON COLUMN influencers.contract_status IS 'Current contract or agreement status';
COMMENT ON COLUMN influencers.products_requested IS 'Products the influencer has requested';
COMMENT ON COLUMN influencers.deliverables IS 'Expected or completed deliverables';
COMMENT ON COLUMN influencers.last_contacted_at IS 'Timestamp of the most recent outreach';
COMMENT ON COLUMN influencers.next_followup_at IS 'Scheduled timestamp for the next follow-up';
