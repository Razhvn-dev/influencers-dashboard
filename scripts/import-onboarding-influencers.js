require('dotenv').config();
const { pool } = require('../db');

const SHOP = process.env.LOCAL_DEV_SHOP || process.env.SEED_SHOP || 'acesefi.myshopify.com';
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_EXISTING = process.argv.includes('--skip-existing');

const ONBOARDING_INFLUENCERS = [
  { name: 'Mike Cotten', ambassador_level: 'Ambassador 5' },
  { name: 'David Newbern', ambassador_level: 'Ambassador 5' },
  { name: 'Levi Weaver', ambassador_level: 'Ambassador 1' },
  { name: 'Austin Lucore', ambassador_level: 'Ambassador 1' },
  { name: 'Sam Hard', ambassador_level: 'Ambassador 5' },
  { name: 'Ernesto Lopez (Nightwrencher Performance)', ambassador_level: 'Ambassador 1' },
  { name: 'John Andrade Sr. (Andrade Racing)', ambassador_level: 'Ambassador 1' },
  { name: 'Russell Grimes (Hot Rod Guy Garage)', ambassador_level: 'Ambassador 1' },
  { name: 'John Church (Church Of LS)', ambassador_level: 'Rising Ambassador' },
  { name: 'Kieran Goth', ambassador_level: 'Rising Ambassador' },
  { name: 'Eddie Pap (Brickrod Garage)', ambassador_level: 'Rising Ambassador' },
  { name: 'Jim Fitchner (Penny Pincher Performance)', ambassador_level: 'Rising Ambassador' },
  { name: 'Jay Sheehan (Irish Outlaw Garage)', ambassador_level: 'Rising Ambassador' },
  { name: 'Cory Butcher', ambassador_level: 'Creator Sponsorship' },
];

async function fetchExistingNames(client) {
  const result = await client.query(
    `
      SELECT name
      FROM influencers
      WHERE shop = $1
    `,
    [SHOP]
  );

  return new Set(result.rows.map((row) => row.name));
}

async function main() {
  const client = await pool.connect();

  try {
    const existingNames = SKIP_EXISTING ? await fetchExistingNames(client) : new Set();
    const toInsert = SKIP_EXISTING
      ? ONBOARDING_INFLUENCERS.filter((record) => !existingNames.has(record.name))
      : ONBOARDING_INFLUENCERS;

    console.log(`Shop: ${SHOP}`);
    console.log(`Mode: ${DRY_RUN ? 'dry-run' : 'import'}${SKIP_EXISTING ? ' (skip-existing)' : ''}`);
    console.log(`Planned inserts: ${toInsert.length} / ${ONBOARDING_INFLUENCERS.length}`);

    if (SKIP_EXISTING) {
      const skipped = ONBOARDING_INFLUENCERS.filter((record) => existingNames.has(record.name));
      if (skipped.length > 0) {
        console.log(`Skipping ${skipped.length} existing name(s): ${skipped.map((r) => r.name).join(', ')}`);
      }
    }

    for (const record of toInsert) {
      console.log(`  + ${record.name} — ${record.ambassador_level}`);
    }

    if (toInsert.length === 0) {
      console.log('Nothing to import.');
      return;
    }

    if (DRY_RUN) {
      console.log('Dry run complete. No database changes made.');
      return;
    }

    await client.query('BEGIN');

    const insertedIds = [];

    for (const record of toInsert) {
      const result = await client.query(
        `
          INSERT INTO influencers (
            shop,
            name,
            ambassador_level,
            status,
            youtube_followers,
            facebook_followers,
            instagram_followers,
            tiktok_followers,
            total_followers
          )
          VALUES ($1, $2, $3, $4, 0, 0, 0, 0, 0)
          RETURNING id
        `,
        [SHOP, record.name, record.ambassador_level, 'Active Ambassador']
      );

      insertedIds.push(result.rows[0].id);
    }

    await client.query('COMMIT');

    console.log(`Imported ${insertedIds.length} onboarding influencer(s).`);
    console.log(`IDs: ${insertedIds.join(', ')}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to import onboarding influencers:', error.message);
  process.exit(1);
});
