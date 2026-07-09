/**
 * Seed curated creators for Dashboard filter regression testing.
 * Usage:
 *   npm run seed:filter-test          # clear shop data, then insert
 *   npm run seed:filter-test:append   # append without clearing
 *
 * Uses LOCAL_DEV_SHOP from .env (falls back to acesefi.myshopify.com).
 */
require('dotenv').config();
const { pool } = require('../db');
const { applyCreatorAutomation } = require('../lib/creatorProfile');
const { computeAmbassadorLevelFromFollowers } = require('../lib/ambassadorLevel');

const SHOP = process.env.LOCAL_DEV_SHOP || process.env.SEED_SHOP || 'acesefi.myshopify.com';
const CLEAR_FIRST = process.argv.includes('--clear');

function daysFromNow(days, hour = 14) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function hoursFromNow(hours) {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date.toISOString();
}

function splitFollowers(total, weights = [0.35, 0.3, 0.15, 0.2]) {
  const youtube = Math.floor(total * weights[0]);
  const instagram = Math.floor(total * weights[1]);
  const facebook = Math.floor(total * weights[2]);
  const tiktok = Math.max(0, total - youtube - instagram - facebook);

  return {
    youtube_followers: youtube,
    instagram_followers: instagram,
    facebook_followers: facebook,
    tiktok_followers: tiktok,
  };
}

function allPlatformUrls(slug) {
  const handle = slug.replace(/\s+/g, '').toLowerCase();
  return {
    youtube_url: `https://youtube.com/@${handle}`,
    instagram_url: `https://instagram.com/${handle}`,
    facebook_url: `https://facebook.com/${handle}`,
    tiktok_url: `https://tiktok.com/@${handle}`,
  };
}

function singlePlatformUrls(platform, slug) {
  const handle = slug.replace(/\s+/g, '').toLowerCase();
  const empty = {
    youtube_url: null,
    instagram_url: null,
    facebook_url: null,
    tiktok_url: null,
  };

  switch (platform) {
    case 'youtube':
      return { ...empty, youtube_url: `https://youtube.com/@${handle}` };
    case 'instagram':
      return { ...empty, instagram_url: `https://instagram.com/${handle}` };
    case 'facebook':
      return { ...empty, facebook_url: `https://facebook.com/${handle}` };
    case 'tiktok':
      return { ...empty, tiktok_url: `https://tiktok.com/@${handle}` };
    default:
      return allPlatformUrls(handle);
  }
}

function buildRecord(spec) {
  const slug = spec.name.replace(/\s+/g, '');
  const urls =
    spec.platform === 'all'
      ? allPlatformUrls(slug)
      : singlePlatformUrls(spec.platform || 'all', slug);

  const followers = splitFollowers(spec.totalFollowers ?? 48000, spec.followerWeights);

  const profile = applyCreatorAutomation({
    email: spec.email || `${slug.toLowerCase()}@filter-test.demo`,
    region: spec.region || 'US',
    status: spec.status || 'Contacted',
    notes: spec.notes || `Filter test: ${spec.purpose}`,
    ...urls,
    ...followers,
    contract_status: spec.contract_status || 'Demo',
    last_contacted_at: spec.last_contacted_at ?? daysFromNow(-5),
    next_followup_at:
      spec.next_followup_at === undefined ? daysFromNow(10) : spec.next_followup_at,
    followers_last_verified_at: spec.followers_last_verified_at ?? daysFromNow(-2),
    followers_verified_by: spec.followers_verified_by ?? 'Filter Test Bot',
  });

  return {
    purpose: spec.purpose,
    name: spec.name,
    channel: spec.channel || `@${slug.toLowerCase()}`,
    sponsored_products: spec.sponsored_products || 'Filter Test Product',
    affiliate_code: spec.affiliate_code ?? '',
    commission: spec.commission ?? 'NO',
    order_numbers: spec.order_numbers ?? '',
    required_deliverables: spec.required_deliverables || '1 demo post',
    ...profile,
  };
}

/** Each row documents which filter(s) it is meant to exercise. */
const FILTER_TEST_SPECS = [
  // --- Status (one per CRM status) ---
  { purpose: 'Status=Applied', name: 'Status Applied', status: 'Applied' },
  { purpose: 'Status=Contacted', name: 'Status Contacted', status: 'Contacted' },
  { purpose: 'Status=Call Scheduled', name: 'Status Call Scheduled', status: 'Call Scheduled' },
  { purpose: 'Status=Under Review', name: 'Status Under Review', status: 'Under Review' },
  { purpose: 'Status=Approved', name: 'Status Approved', status: 'Approved' },
  { purpose: 'Status=Rejected', name: 'Status Rejected', status: 'Rejected' },
  {
    purpose: 'Status=Active Ambassador',
    name: 'Status Active Ambassador',
    status: 'Active Ambassador',
    totalFollowers: 150000,
  },
  { purpose: 'Status=Past Partner', name: 'Status Past Partner', status: 'Past Partner' },
  { purpose: 'Status=Partnered (legacy)', name: 'Status Partnered Legacy', status: 'Partnered' },

  // --- Ambassador level boundaries ---
  {
    purpose: 'Level=Creator Sponsorship (<100k)',
    name: 'Level CS Boundary',
    status: 'Contacted',
    totalFollowers: 99999,
  },
  {
    purpose: 'Level=Ambassador 1 (100k floor)',
    name: 'Level A1 Floor',
    status: 'Contacted',
    totalFollowers: 100000,
  },
  {
    purpose: 'Level=Ambassador 1 (499k ceiling)',
    name: 'Level A1 Ceiling',
    status: 'Contacted',
    totalFollowers: 499999,
  },
  {
    purpose: 'Level=Ambassador 2 (500k floor)',
    name: 'Level A2 Floor',
    status: 'Contacted',
    totalFollowers: 500000,
  },
  {
    purpose: 'Level=Ambassador 2 (999k ceiling)',
    name: 'Level A2 Ceiling',
    status: 'Contacted',
    totalFollowers: 999999,
  },
  {
    purpose: 'Level=Ambassador 3 (1M+)',
    name: 'Level A3 Mega',
    status: 'Contacted',
    totalFollowers: 1250000,
  },

  // --- Next follow-up: overdue vs due in 7d vs future vs none ---
  {
    purpose: 'Follow-up=Overdue (-14d)',
    name: 'Followup Overdue Two Weeks',
    status: 'Contacted',
    next_followup_at: daysFromNow(-14),
  },
  {
    purpose: 'Follow-up=Overdue (-3d)',
    name: 'Followup Overdue Three Days',
    status: 'Under Review',
    next_followup_at: daysFromNow(-3),
  },
  {
    purpose: 'Follow-up=Overdue (-1d)',
    name: 'Followup Overdue Yesterday',
    status: 'Applied',
    next_followup_at: daysFromNow(-1),
  },
  {
    purpose: 'Follow-up=Due today (in 7d window)',
    name: 'Followup Due Today',
    status: 'Call Scheduled',
    next_followup_at: hoursFromNow(4),
  },
  {
    purpose: 'Follow-up=Due in 3 days',
    name: 'Followup Due Three Days',
    status: 'Approved',
    next_followup_at: daysFromNow(3),
  },
  {
    purpose: 'Follow-up=Due in 7 days (window edge)',
    name: 'Followup Due Seven Days',
    status: 'Contacted',
    next_followup_at: daysFromNow(7),
  },
  {
    purpose: 'Follow-up=Future beyond 7d (not in Due filter)',
    name: 'Followup Future Two Weeks',
    status: 'Contacted',
    next_followup_at: daysFromNow(14),
  },
  {
    purpose: 'Follow-up=None (null)',
    name: 'Followup None Scheduled',
    status: 'Rejected',
    next_followup_at: null,
  },

  // --- Platform URL presence (filter checks non-empty URL column) ---
  {
    purpose: 'Platform=YouTube URL only',
    name: 'Platform YouTube Only',
    platform: 'youtube',
    followerWeights: [1, 0, 0, 0],
    totalFollowers: 88000,
  },
  {
    purpose: 'Platform=Instagram URL only',
    name: 'Platform Instagram Only',
    platform: 'instagram',
    followerWeights: [0, 1, 0, 0],
    totalFollowers: 92000,
  },
  {
    purpose: 'Platform=Facebook URL only',
    name: 'Platform Facebook Only',
    platform: 'facebook',
    followerWeights: [0, 0, 1, 0],
    totalFollowers: 76000,
  },
  {
    purpose: 'Platform=TikTok URL only',
    name: 'Platform TikTok Only',
    platform: 'tiktok',
    followerWeights: [0, 0, 0, 1],
    totalFollowers: 105000,
  },

  // --- Commission ---
  {
    purpose: 'Commission=YES + affiliate code',
    name: 'Commission Yes Alpha',
    commission: 'YES',
    affiliate_code: 'AFF-YES-ALPHA',
    totalFollowers: 220000,
    status: 'Active Ambassador',
  },
  {
    purpose: 'Commission=YES + orders',
    name: 'Commission Yes Beta',
    commission: 'YES',
    affiliate_code: 'AFF-YES-BETA',
    order_numbers: '#FT-9001, #FT-9002',
    totalFollowers: 180000,
    status: 'Approved',
  },
  {
    purpose: 'Commission=NO',
    name: 'Commission No Gamma',
    commission: 'NO',
    affiliate_code: '',
    totalFollowers: 45000,
  },
  {
    purpose: 'Commission=NO (empty affiliate)',
    name: 'Commission No Delta',
    commission: 'NO',
    totalFollowers: 62000,
    status: 'Applied',
  },

  // --- Search tokens (unique strings per searchable column) ---
  {
    purpose: 'Search=name token ZEPHYRNAME',
    name: 'ZEPHYRNAME Search Target',
    channel: '@regular-channel',
    region: 'US',
  },
  {
    purpose: 'Search=channel token ZEPHYRCHANNEL',
    name: 'Channel Search Person',
    channel: 'ZEPHYRCHANNEL Official',
  },
  {
    purpose: 'Search=product token ZEPHYRPRODUCT',
    name: 'Product Search Person',
    sponsored_products: 'ZEPHYRPRODUCT Limited Edition',
  },
  {
    purpose: 'Search=affiliate token ZEPHYRAFF',
    name: 'Affiliate Search Person',
    affiliate_code: 'ZEPHYRAFF-2026',
    commission: 'YES',
  },
  {
    purpose: 'Search=order token ZEPHYRORDER',
    name: 'Order Search Person',
    order_numbers: 'ZEPHYRORDER-7788',
    commission: 'YES',
  },
  {
    purpose: 'Search=email token zephyr@filter.demo',
    name: 'Email Search Person',
    email: 'zephyr@filter.demo',
  },
  {
    purpose: 'Search=region token ZEPHYRREGION',
    name: 'Region Search Person',
    region: 'ZEPHYRREGION',
  },

  // --- Multi-filter combos ---
  {
    purpose: 'Combo: Active + A2 + Overdue + Commission YES',
    name: 'Combo Active Overdue',
    status: 'Active Ambassador',
    totalFollowers: 650000,
    commission: 'YES',
    affiliate_code: 'COMBO-OVERDUE',
    next_followup_at: daysFromNow(-2),
    platform: 'all',
  },
  {
    purpose: 'Combo: Approved + Due 7d + IG only + CS level',
    name: 'Combo Approved Due IG',
    status: 'Approved',
    totalFollowers: 55000,
    platform: 'instagram',
    followerWeights: [0, 1, 0, 0],
    next_followup_at: daysFromNow(5),
    commission: 'NO',
  },
  {
    purpose: 'Combo: Contacted + A3 + Future follow-up + YT',
    name: 'Combo Contacted Mega YT',
    status: 'Contacted',
    totalFollowers: 2100000,
    platform: 'youtube',
    followerWeights: [1, 0, 0, 0],
    next_followup_at: daysFromNow(21),
    commission: 'YES',
    affiliate_code: 'COMBO-MEGA',
  },
  {
    purpose: 'Combo: Past Partner + No follow-up + Multi-region DE',
    name: 'Combo Past Partner DE',
    status: 'Past Partner',
    region: 'DE',
    next_followup_at: null,
    totalFollowers: 310000,
    commission: 'NO',
  },
];

async function insertCreator(client, creator) {
  const result = await client.query(
    `
      INSERT INTO influencers (
        shop,
        name,
        channel,
        sponsored_products,
        affiliate_code,
        commission,
        order_numbers,
        required_deliverables,
        email,
        region,
        status,
        notes,
        youtube_url,
        facebook_url,
        instagram_url,
        tiktok_url,
        youtube_followers,
        facebook_followers,
        instagram_followers,
        tiktok_followers,
        total_followers,
        ambassador_level,
        contract_status,
        last_contacted_at,
        next_followup_at,
        followers_last_verified_at,
        followers_verified_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27
      )
      RETURNING id, name, status, total_followers, next_followup_at, commission
    `,
    [
      SHOP,
      creator.name,
      creator.channel,
      creator.sponsored_products,
      creator.affiliate_code,
      creator.commission,
      creator.order_numbers,
      creator.required_deliverables,
      creator.email,
      creator.region,
      creator.status,
      creator.notes,
      creator.youtube_url,
      creator.facebook_url,
      creator.instagram_url,
      creator.tiktok_url,
      creator.youtube_followers,
      creator.facebook_followers,
      creator.instagram_followers,
      creator.tiktok_followers,
      creator.total_followers,
      creator.ambassador_level,
      creator.contract_status,
      creator.last_contacted_at,
      creator.next_followup_at,
      creator.followers_last_verified_at,
      creator.followers_verified_by,
    ]
  );

  return result.rows[0];
}

function printManifest(rows) {
  console.log('\n--- Filter test manifest ---');
  console.log(`Shop: ${SHOP}`);
  console.log(`Total records: ${rows.length}\n`);

  const now = Date.now();
  let overdue = 0;
  let due7d = 0;

  for (const row of rows) {
    if (row.next_followup_at) {
      const ts = new Date(row.next_followup_at).getTime();
      if (ts < now) overdue += 1;
      else if (ts <= now + 7 * 24 * 60 * 60 * 1000) due7d += 1;
    }

    const level = computeAmbassadorLevelFromFollowers(row.total_followers);
    console.log(
      `#${String(row.id).padStart(3)} | ${row.name.padEnd(28)} | ${row.purpose}`
    );
    console.log(
      `       status=${row.status} level=${level} commission=${row.commission || '—'}`
    );
  }

  console.log('\n--- Expected KPI-style counts (approx.) ---');
  console.log(`Overdue follow-ups: ${overdue}`);
  console.log(`Due in 7 days (excl. overdue): ${due7d}`);
  console.log('\nSearch quick checks: ZEPHYRNAME, ZEPHYRCHANNEL, ZEPHYRPRODUCT, ZEPHYRAFF, ZEPHYRORDER, zephyr@filter.demo, ZEPHYRREGION');
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (CLEAR_FIRST) {
      await client.query('DELETE FROM influencer_monthly_progress WHERE shop = $1', [SHOP]);
      await client.query('DELETE FROM influencers WHERE shop = $1', [SHOP]);
      console.log(`Cleared existing records for shop: ${SHOP}`);
    }

    const creators = FILTER_TEST_SPECS.map((spec) => buildRecord(spec));
    const inserted = [];

    for (let index = 0; index < creators.length; index += 1) {
      const creator = creators[index];
      const row = await insertCreator(client, creator);
      inserted.push({
        ...row,
        purpose: FILTER_TEST_SPECS[index].purpose,
      });
    }

    await client.query('COMMIT');
    printManifest(inserted);
    console.log(`\nInserted ${inserted.length} filter-test creator(s).`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to seed filter test data:', error.message);
  process.exit(1);
});
