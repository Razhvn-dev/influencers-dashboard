require('dotenv').config();
const { pool } = require('../db');
const { applyCreatorAutomation } = require('../lib/creatorProfile');

const SHOP = process.env.LOCAL_DEV_SHOP || process.env.SEED_SHOP || 'acesefi.myshopify.com';
const CLEAR_FIRST = process.argv.includes('--clear');
const CREATOR_COUNT = Number(process.env.SEED_COUNT || 32);

const STATUSES = [
  'Applied',
  'Contacted',
  'Negotiating',
  'Contract Signed',
  'Approved',
  'Rejected',
  'Call Scheduled',
  'Under Review',
  'Active Ambassador',
  'Past Partner',
];

const VERIFIERS = ['Yan Xin', 'Alex Chen', 'Morgan Lee', 'Jamie Park'];

const FIRST_NAMES = [
  'Ava',
  'Noah',
  'Mia',
  'Liam',
  'Sophia',
  'Ethan',
  'Isabella',
  'Mason',
  'Olivia',
  'Lucas',
  'Emma',
  'Jackson',
  'Amelia',
  'Aiden',
  'Harper',
  'Elijah',
  'Evelyn',
  'James',
  'Abigail',
  'Benjamin',
  'Josh',
  'Sarah',
  'Daniel',
  'Grace',
  'Henry',
  'Chloe',
  'Leo',
  'Zoe',
];

const CHANNELS = [
  'Tech Reviews',
  'Fitness Daily',
  'Beauty Lab',
  'Gaming Zone',
  'Home DIY',
  'Food Explorer',
  'Travel Vlog',
  'Parenting Tips',
  'Finance 101',
  'Outdoor Life',
];

const PRODUCTS = [
  'Pro Headphones',
  'Smart Watch',
  'Skincare Bundle',
  'Protein Pack',
  'LED Ring Light',
  'Yoga Mat Set',
  'Coffee Maker',
  'Running Shoes',
  'Wireless Mic',
  'Backpack Pro',
];

const CURATED_CREATORS = [
  {
    name: 'Josh',
    channel: '@joshcreates',
    status: 'Negotiating',
    youtube_followers: 420000,
    instagram_followers: 310000,
    facebook_followers: 85000,
    tiktok_followers: 280000,
    last_contacted_at: daysFromNow(-3),
    next_followup_at: daysFromNow(1),
    followers_last_verified_at: daysFromNow(-2),
    followers_verified_by: 'Yan Xin',
  },
  {
    name: 'Benjamin Kim',
    channel: '@benjaminkim',
    status: 'Contacted',
    youtube_followers: 180000,
    instagram_followers: 95000,
    facebook_followers: 42000,
    tiktok_followers: 120000,
    last_contacted_at: daysFromNow(-5),
    next_followup_at: daysFromNow(-1),
    followers_last_verified_at: daysFromNow(-4),
    followers_verified_by: 'Alex Chen',
  },
  {
    name: 'Sarah Chen',
    channel: '@sarahchen',
    status: 'Applied',
    youtube_followers: 76000,
    instagram_followers: 54000,
    facebook_followers: 18000,
    tiktok_followers: 88000,
    last_contacted_at: daysFromNow(-7),
    next_followup_at: daysFromNow(3),
    followers_last_verified_at: daysFromNow(-6),
    followers_verified_by: 'Morgan Lee',
  },
  {
    name: 'Huang',
    channel: '@HK',
    status: 'Contract Signed',
    youtube_followers: 2200000,
    instagram_followers: 980000,
    facebook_followers: 420000,
    tiktok_followers: 1600000,
    last_contacted_at: daysFromNow(-1),
    next_followup_at: daysFromNow(14),
    followers_last_verified_at: daysFromNow(-1),
    followers_verified_by: 'Yan Xin',
  },
];

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 30, 0, 0);
  return date.toISOString();
}

function buildMonthlyProgress(index) {
  return Array.from({ length: 5 }, (_, periodIndex) => {
    const period = periodIndex + 1;

    if (period <= index % 4) {
      return {
        period_index: period,
        monthly_check_in: period % 2 === 0 ? 'YES' : 'NO',
        content_delivered: `Demo content for period ${period}`,
        link: `https://example.com/demo/creator-${index + 1}/period-${period}`,
      };
    }

    if (period === (index % 4) + 1) {
      return {
        period_index: period,
        monthly_check_in: 'YES',
        content_delivered: '',
        link: '',
      };
    }

    return {
      period_index: period,
      monthly_check_in: '',
      content_delivered: '',
      link: '',
    };
  });
}

function buildCreator(index, curated = null) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = ['Chen', 'Rivera', 'Patel', 'Brooks', 'Kim', 'Nguyen', 'Wong'][index % 7];
  const name = curated?.name || `${firstName} ${lastName}`;
  const handle = curated?.channel || `${CHANNELS[index % CHANNELS.length]} / @${firstName.toLowerCase()}${index + 1}`;
  const followersBase = [12000, 85000, 150000, 420000, 620000, 1060000][index % 6];

  const profile = applyCreatorAutomation({
    email: `${name.replace(/\s+/g, '.').toLowerCase()}@demo-mail.test`,
    region: index % 3 === 0 ? 'US' : index % 3 === 1 ? 'CA' : 'UK',
    status: curated?.status || STATUSES[index % STATUSES.length],
    notes: `Demo record ${index + 1} for dashboard testing.`,
    youtube_url: `https://youtube.com/@${name.replace(/\s+/g, '').toLowerCase()}${index + 1}`,
    instagram_url: `https://instagram.com/${name.replace(/\s+/g, '').toLowerCase()}${index + 1}`,
    facebook_url: `https://facebook.com/${name.replace(/\s+/g, '').toLowerCase()}${index + 1}`,
    tiktok_url: `https://tiktok.com/@${name.replace(/\s+/g, '').toLowerCase()}${index + 1}`,
    youtube_followers: curated?.youtube_followers ?? followersBase + index * 2500,
    instagram_followers:
      curated?.instagram_followers ?? Math.round(followersBase * 0.6) + index * 1200,
    facebook_followers:
      curated?.facebook_followers ?? Math.round(followersBase * 0.2) + index * 400,
    tiktok_followers:
      curated?.tiktok_followers ?? Math.round(followersBase * 0.8) + index * 1800,
    contract_status: index % 2 === 0 ? 'Signed 2026' : 'Pending renewal',
    last_contacted_at: curated?.last_contacted_at || daysFromNow(-(index + 3)),
    next_followup_at:
      curated?.next_followup_at ||
      (index % 5 === 0
        ? daysFromNow(-(index % 3) - 1)
        : index % 4 === 0
          ? daysFromNow(1)
          : daysFromNow(10 + index)),
    followers_last_verified_at:
      curated?.followers_last_verified_at || daysFromNow(-(index % 8) - 1),
    followers_verified_by:
      curated?.followers_verified_by || VERIFIERS[index % VERIFIERS.length],
  });

  return {
    name,
    channel: handle,
    sponsored_products: PRODUCTS[index % PRODUCTS.length],
    affiliate_code: `DEMO${String(index + 1).padStart(3, '0')}`,
    commission: index % 3 === 0 ? 'YES' : 'NO',
    order_numbers: index % 2 === 0 ? `#D${1000 + index}, #D${2000 + index}` : '',
    required_deliverables: '1 YouTube review + 2 IG stories per month',
    ...profile,
    monthly_progress: buildMonthlyProgress(index),
  };
}

async function saveMonthlyProgress(client, influencerId, shop, monthlyProgress) {
  for (const period of monthlyProgress) {
    const hasValues =
      period.monthly_check_in || period.content_delivered || period.link;

    if (!hasValues) continue;

    await client.query(
      `
        INSERT INTO influencer_monthly_progress (
          influencer_id,
          shop,
          period_index,
          monthly_check_in,
          content_delivered,
          link
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        influencerId,
        shop,
        period.period_index,
        period.monthly_check_in || null,
        period.content_delivered || null,
        period.link || null,
      ]
    );
  }
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (CLEAR_FIRST) {
      await client.query(
        'DELETE FROM influencer_monthly_progress WHERE shop = $1',
        [SHOP]
      );
      await client.query('DELETE FROM influencers WHERE shop = $1', [SHOP]);
      console.log(`Cleared existing records for shop: ${SHOP}`);
    }

    const creators = [];

    for (let index = 0; index < Math.min(CURATED_CREATORS.length, CREATOR_COUNT); index += 1) {
      creators.push(buildCreator(index, CURATED_CREATORS[index]));
    }

    for (let index = CURATED_CREATORS.length; index < CREATOR_COUNT; index += 1) {
      creators.push(buildCreator(index));
    }

    const insertedIds = [];

    for (const creator of creators) {
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
          RETURNING id
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

      const influencerId = result.rows[0].id;
      await saveMonthlyProgress(client, influencerId, SHOP, creator.monthly_progress);
      insertedIds.push(influencerId);
    }

    await client.query('COMMIT');

    console.log(`Inserted ${insertedIds.length} demo creator(s) for shop: ${SHOP}`);
    console.log(`Creator IDs: ${insertedIds.join(', ')}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to seed demo data:', error.message);
  process.exit(1);
});
