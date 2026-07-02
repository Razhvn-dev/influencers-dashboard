require('dotenv').config();
const { pool } = require('../db');
const { applyCreatorAutomation } = require('../lib/creatorProfile');

const SHOP = process.env.LOCAL_DEV_SHOP || process.env.SEED_SHOP || 'acesefi.myshopify.com';
const CLEAR_FIRST = process.argv.includes('--clear');

const STATUSES = [
  'Applied',
  'Contacted',
  'Call Scheduled',
  'Under Review',
  'Approved',
  'Active Ambassador',
  'Past Partner',
];

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

    if (period === index % 4 + 1) {
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

function buildCreator(index) {
  const firstName = FIRST_NAMES[index];
  const lastName = ['Chen', 'Rivera', 'Patel', 'Brooks', 'Kim'][index % 5];
  const name = `${firstName} ${lastName}`;
  const followersBase = [12000, 85000, 150000, 420000, 620000][index % 5];

  const profile = applyCreatorAutomation({
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo-mail.test`,
    region: index % 3 === 0 ? 'US' : index % 3 === 1 ? 'CA' : 'UK',
    status: STATUSES[index % STATUSES.length],
    notes: `Demo record ${index + 1} for dashboard testing.`,
    youtube_url: `https://youtube.com/@${firstName.toLowerCase()}${index + 1}`,
    instagram_url: `https://instagram.com/${firstName.toLowerCase()}${index + 1}`,
    facebook_url: `https://facebook.com/${firstName.toLowerCase()}${index + 1}`,
    tiktok_url: `https://tiktok.com/@${firstName.toLowerCase()}${index + 1}`,
    youtube_followers: followersBase + index * 2500,
    instagram_followers: Math.round(followersBase * 0.6) + index * 1200,
    facebook_followers: Math.round(followersBase * 0.2) + index * 400,
    tiktok_followers: Math.round(followersBase * 0.8) + index * 1800,
    contract_status: index % 2 === 0 ? 'Signed 2026' : 'Pending renewal',
    last_contacted_at: daysFromNow(-(index + 3)),
    next_followup_at: index % 4 === 0 ? daysFromNow(index % 6) : daysFromNow(10 + index),
  });

  return {
    name,
    channel: `${CHANNELS[index % CHANNELS.length]} / @${firstName.toLowerCase()}${index + 1}`,
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

    const creators = Array.from({ length: 20 }, (_, index) => buildCreator(index));
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
            next_followup_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25
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
