const express = require('express');
const { pool } = require('../db');
const {
  parseSponsorshipCsv,
  exportSponsorshipCsv,
  emptyMonthlyProgress,
  cleanCell,
} = require('../lib/sponsorshipCsv');
const { exportInfluencersCsv } = require('../lib/influencersCsv');
const { exportInfluencersXlsx } = require('../lib/influencersXlsx');
const {
  mergeProfileFields,
  normalizeProfilePayload,
} = require('../lib/creatorProfile');
const { applyFollowerVerification } = require('../lib/followerVerification');
const { normalizeCreatorIdentity } = require('../lib/creatorIdentity');
const { getCached, invalidateShop } = require('../lib/shopCache');
const {
  buildAmbassadorLevelOrderClause,
  enrichInfluencerRecord,
  getAmbassadorLevelFilterCondition,
} = require('../lib/ambassadorLevel');

const router = express.Router();

const INFLUENCER_ROW_SELECT = `
  i.id,
  i.name,
  i.business_name,
  i.first_name,
  i.last_name,
  i.channel,
  i.sponsored_products,
  i.affiliate_code,
  i.commission,
  i.order_numbers,
  i.required_deliverables,
  i.email,
  i.region,
  i.status,
  i.notes,
  i.youtube_url,
  i.facebook_url,
  i.instagram_url,
  i.tiktok_url,
  i.youtube_followers,
  i.facebook_followers,
  i.instagram_followers,
  i.tiktok_followers,
  i.total_followers,
  i.ambassador_level,
  i.contract_status,
  i.last_contacted_at,
  i.next_followup_at,
  i.followers_last_verified_at,
  i.followers_verified_by,
  i.niche_category,
  i.bio,
  i.tags,
  i.manager_owner,
  i.created_at,
  i.updated_at
`;

const INFLUENCER_RETURNING_COLUMNS = `
  id,
  name,
  business_name,
  first_name,
  last_name,
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
  followers_verified_by,
  niche_category,
  bio,
  tags,
  manager_owner,
  created_at,
  updated_at
`;

const SORT_COLUMNS = {
  name: 'i.name',
  business_name: 'i.business_name',
  channel: 'i.channel',
  affiliate_code: 'i.affiliate_code',
  commission: 'i.commission',
  status: 'i.status',
  ambassador_level: 'i.ambassador_level',
  total_followers: 'i.total_followers',
  last_contacted_at: 'i.last_contacted_at',
  next_followup_at: 'i.next_followup_at',
  followers_last_verified_at: 'i.followers_last_verified_at',
  id: 'i.id',
};

const PLATFORM_URL_COLUMNS = {
  youtube_url: 'i.youtube_url',
  instagram_url: 'i.instagram_url',
  facebook_url: 'i.facebook_url',
  tiktok_url: 'i.tiktok_url',
};

function getShop(res) {
  const shop = res.locals?.shopify?.session?.shop;

  if (!shop) {
    const error = new Error('Missing shop session. Please refresh the page and try again.');
    error.statusCode = 401;
    throw error;
  }

  return shop;
}

function buildOrderClause(query) {
  if (query.sort_by === 'ambassador_level') {
    return buildAmbassadorLevelOrderClause(query.sort_dir);
  }

  const sortKey = SORT_COLUMNS[query.sort_by] || 'i.id';
  const sortDir = query.sort_dir === 'asc' ? 'ASC' : 'DESC';
  return `ORDER BY ${sortKey} ${sortDir} NULLS LAST`;
}

function buildListFilters(shop, query) {
  const { search, affiliate_code, commission, status, ambassador_level } = query;
  const conditions = ['i.shop = $1'];
  const values = [shop];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(i.name ILIKE $${values.length}
        OR i.business_name ILIKE $${values.length}
        OR i.first_name ILIKE $${values.length}
        OR i.last_name ILIKE $${values.length}
        OR i.channel ILIKE $${values.length}
        OR i.sponsored_products ILIKE $${values.length}
        OR i.affiliate_code ILIKE $${values.length}
        OR i.order_numbers ILIKE $${values.length}
        OR i.email ILIKE $${values.length}
        OR i.region ILIKE $${values.length})`
    );
  }

  if (affiliate_code) {
    values.push(affiliate_code);
    conditions.push(`i.affiliate_code = $${values.length}`);
  }

  if (commission) {
    values.push(commission);
    conditions.push(`i.commission = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`i.status = $${values.length}`);
  }

  if (ambassador_level) {
    const levelCondition = getAmbassadorLevelFilterCondition(ambassador_level);
    if (levelCondition) {
      conditions.push(levelCondition);
    }
  }

  if (query.platform && PLATFORM_URL_COLUMNS[query.platform]) {
    const column = PLATFORM_URL_COLUMNS[query.platform];
    conditions.push(`${column} IS NOT NULL AND TRIM(${column}) <> ''`);
  }

  if (query.due_followup === 'due') {
    conditions.push(
      `i.next_followup_at IS NOT NULL AND i.next_followup_at >= NOW() AND i.next_followup_at <= NOW() + INTERVAL '7 days'`
    );
  } else if (query.due_followup === 'overdue') {
    conditions.push(`i.next_followup_at IS NOT NULL AND i.next_followup_at < NOW()`);
  }

  return { conditions, values };
}

function influencerRowValues(payload) {
  return [
    payload.name,
    payload.business_name,
    payload.first_name,
    payload.last_name,
    payload.channel,
    payload.sponsored_products,
    payload.affiliate_code,
    payload.commission,
    payload.order_numbers,
    payload.required_deliverables,
    payload.email,
    payload.region,
    payload.status,
    payload.notes,
    payload.youtube_url,
    payload.facebook_url,
    payload.instagram_url,
    payload.tiktok_url,
    payload.youtube_followers,
    payload.facebook_followers,
    payload.instagram_followers,
    payload.tiktok_followers,
    payload.total_followers,
    payload.ambassador_level,
    payload.contract_status,
    payload.last_contacted_at,
    payload.next_followup_at,
    payload.followers_last_verified_at,
    payload.followers_verified_by,
    payload.niche_category,
    payload.bio,
    payload.tags,
    payload.manager_owner,
  ];
}

function normalizeMonthlyProgress(input) {
  const base = emptyMonthlyProgress();
  const source = Array.isArray(input) ? input : [];

  return base.map((period) => {
    const match = source.find((item) => Number(item.period_index) === period.period_index);
    if (!match) return period;

    return {
      period_index: period.period_index,
      monthly_check_in: cleanCell(match.monthly_check_in),
      content_delivered: cleanCell(match.content_delivered),
      link: cleanCell(match.link),
    };
  });
}

function buildRecordPayload(body, existing = {}) {
  const identity = normalizeCreatorIdentity(body, existing);
  const name = identity.name;

  if (!name) {
    const error = new Error('Field "name" is required');
    error.statusCode = 400;
    throw error;
  }

  const profile = normalizeProfilePayload(
    mergeProfileFields(existing, {
      email: body.email,
      region: body.region,
      status: body.status,
      notes: body.notes,
      youtube_url: body.youtube_url,
      facebook_url: body.facebook_url,
      instagram_url: body.instagram_url,
      tiktok_url: body.tiktok_url,
      youtube_followers: body.youtube_followers,
      facebook_followers: body.facebook_followers,
      instagram_followers: body.instagram_followers,
      tiktok_followers: body.tiktok_followers,
      contract_status: body.contract_status,
      last_contacted_at: body.last_contacted_at,
      next_followup_at: body.next_followup_at,
    })
  );

  return {
    name,
    ...identity,
    channel: cleanCell(body.channel ?? existing.channel),
    sponsored_products: cleanCell(body.sponsored_products ?? existing.sponsored_products),
    affiliate_code: cleanCell(body.affiliate_code ?? existing.affiliate_code),
    commission: cleanCell(body.commission ?? existing.commission),
    order_numbers: cleanCell(body.order_numbers ?? existing.order_numbers),
    required_deliverables: cleanCell(
      body.required_deliverables ?? existing.required_deliverables
    ),
    niche_category: cleanCell(body.niche_category ?? existing.niche_category),
    bio: cleanCell(body.bio ?? existing.bio),
    tags: cleanCell(body.tags ?? existing.tags),
    manager_owner: cleanCell(body.manager_owner ?? existing.manager_owner),
    ...profile,
    ambassador_level: profile.ambassador_level,
    monthly_progress: normalizeMonthlyProgress(
      body.monthly_progress ?? existing.monthly_progress
    ),
  };
}

async function fetchMonthlyProgress(influencerId, shop, client = pool) {
  const result = await client.query(
    `
      SELECT period_index, monthly_check_in, content_delivered, link
      FROM influencer_monthly_progress
      WHERE influencer_id = $1 AND shop = $2
      ORDER BY period_index ASC
    `,
    [influencerId, shop]
  );

  if (result.rowCount === 0) {
    return emptyMonthlyProgress();
  }

  return normalizeMonthlyProgress(result.rows);
}

function groupMonthlyProgressRows(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const influencerId = String(row.influencer_id);
    if (!grouped.has(influencerId)) {
      grouped.set(influencerId, []);
    }
    grouped.get(influencerId).push(row);
  }

  return grouped;
}

async function fetchMonthlyProgressForIds(influencerIds, shop, client = pool) {
  if (!influencerIds.length) {
    return new Map();
  }

  const result = await client.query(
    `
      SELECT influencer_id, period_index, monthly_check_in, content_delivered, link
      FROM influencer_monthly_progress
      WHERE shop = $1 AND influencer_id = ANY($2::bigint[])
      ORDER BY influencer_id ASC, period_index ASC
    `,
    [shop, influencerIds]
  );

  return groupMonthlyProgressRows(result.rows);
}

function composeEnrichedRecord(row, monthlyProgress) {
  const record = enrichInfluencerRecord(row);
  record.monthly_progress = monthlyProgress;
  return record;
}

async function fetchInfluencerRow(id, shop, client = pool) {
  const result = await client.query(
    `
      SELECT ${INFLUENCER_ROW_SELECT.replace(/\s+/g, ' ').trim()}
      FROM influencers i
      WHERE i.id = $1 AND i.shop = $2
    `,
    [id, shop]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

async function fetchInfluencerRecord(id, shop) {
  const [row, progressResult] = await Promise.all([
    fetchInfluencerRow(id, shop),
    pool.query(
      `
        SELECT period_index, monthly_check_in, content_delivered, link
        FROM influencer_monthly_progress
        WHERE influencer_id = $1 AND shop = $2
        ORDER BY period_index ASC
      `,
      [id, shop]
    ),
  ]);

  if (!row) {
    return null;
  }

  const monthlyProgress =
    progressResult.rowCount === 0
      ? emptyMonthlyProgress()
      : normalizeMonthlyProgress(progressResult.rows);

  return composeEnrichedRecord(row, monthlyProgress);
}

async function fetchInfluencerRecordsForExport(shop, conditions, values, orderClause) {
  const result = await pool.query(
    `
      SELECT ${INFLUENCER_ROW_SELECT.replace(/\s+/g, ' ').trim()}
      FROM influencers i
      WHERE ${conditions.join(' AND ')}
      ${orderClause}
    `,
    values
  );

  if (result.rowCount === 0) {
    return [];
  }

  const influencerIds = result.rows.map((row) => row.id);
  const progressById = await fetchMonthlyProgressForIds(influencerIds, shop);

  return result.rows.map((row) => {
    const progressRows = progressById.get(String(row.id)) || [];
    const monthlyProgress =
      progressRows.length === 0
        ? emptyMonthlyProgress()
        : normalizeMonthlyProgress(progressRows);

    return composeEnrichedRecord(row, monthlyProgress);
  });
}

async function saveMonthlyProgress(client, influencerId, shop, monthlyProgress) {
  const toUpsert = [];
  const toDelete = [];

  for (const period of monthlyProgress) {
    const hasValues =
      period.monthly_check_in || period.content_delivered || period.link;

    if (hasValues) {
      toUpsert.push(period);
    } else {
      toDelete.push(period.period_index);
    }
  }

  if (toDelete.length) {
    await client.query(
      `
        DELETE FROM influencer_monthly_progress
        WHERE influencer_id = $1 AND shop = $2 AND period_index = ANY($3::int[])
      `,
      [influencerId, shop, toDelete]
    );
  }

  if (!toUpsert.length) {
    return;
  }

  const values = [];
  const placeholders = [];

  for (let index = 0; index < toUpsert.length; index += 1) {
    const period = toUpsert[index];
    const offset = index * 6;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
    );
    values.push(
      influencerId,
      shop,
      period.period_index,
      period.monthly_check_in,
      period.content_delivered,
      period.link
    );
  }

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
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (influencer_id, period_index)
      DO UPDATE SET
        shop = EXCLUDED.shop,
        monthly_check_in = EXCLUDED.monthly_check_in,
        content_delivered = EXCLUDED.content_delivered,
        link = EXCLUDED.link
    `,
    values
  );
}

router.get('/stats/summary', async (req, res) => {
  try {
    const shop = getShop(res);
    const data = await getCached(`${shop}:stats`, 30_000, async () => {
      const result = await pool.query(
        `
          SELECT
            COUNT(*)::INT AS total,
            COUNT(*) FILTER (
              WHERE status IN ('Active Ambassador', 'Partnered')
            )::INT AS partnered,
            COUNT(*) FILTER (
              WHERE status IN ('Applied', 'Contacted', 'Call Scheduled', 'Under Review')
            )::INT AS in_discussion,
            COUNT(*) FILTER (
              WHERE status IN ('Active Ambassador', 'Partnered', 'Approved')
            )::INT AS contract_signed,
            COUNT(*) FILTER (
              WHERE total_followers >= 100000
            )::INT AS elevated_levels,
            COUNT(*) FILTER (
              WHERE next_followup_at IS NOT NULL
                AND next_followup_at < NOW()
            )::INT AS followups_overdue,
            COUNT(*) FILTER (
              WHERE next_followup_at IS NOT NULL
                AND next_followup_at >= NOW()
                AND next_followup_at <= NOW() + INTERVAL '7 days'
            )::INT AS followups_due_7d,
            COUNT(*) FILTER (
              WHERE affiliate_code IS NOT NULL AND affiliate_code <> ''
            )::INT AS with_affiliate_code,
            COUNT(*) FILTER (WHERE commission = 'YES')::INT AS with_commission,
            (
              SELECT COUNT(DISTINCT mp.influencer_id)::INT
              FROM influencer_monthly_progress mp
              WHERE mp.shop = $1
                AND (
                  mp.content_delivered IS NOT NULL
                  OR mp.link IS NOT NULL
                )
            ) AS with_content_logged,
            COALESCE(SUM(total_followers), 0)::BIGINT AS total_followers_sum
          FROM influencers
          WHERE shop = $1
        `,
        [shop]
      );

      return result.rows[0];
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('Failed to fetch influencer stats:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencer stats',
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const shop = getShop(res);
    const { conditions, values } = buildListFilters(shop, req.query);
    const orderClause = buildOrderClause(req.query);

    const result = await pool.query(
      `
        SELECT ${INFLUENCER_ROW_SELECT.replace(/\s+/g, ' ').trim()}
        FROM influencers i
        WHERE ${conditions.join(' AND ')}
        ${orderClause}
      `,
      values
    );

    const records = result.rows.map((row) => enrichInfluencerRecord(row));

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error('Failed to fetch sponsorship records:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsorship records',
    });
  }
});

router.get('/export/xlsx', async (req, res) => {
  try {
    const shop = getShop(res);
    const { conditions, values } = buildListFilters(shop, req.query);
    const orderClause = buildOrderClause(req.query);

    const records = await fetchInfluencerRecordsForExport(
      shop,
      conditions,
      values,
      orderClause
    );

    const buffer = await exportInfluencersXlsx(records);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="influencers.xlsx"');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Failed to export influencers XLSX:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to export influencers Excel file',
    });
  }
});

router.get('/export/csv', async (req, res) => {
  try {
    const shop = getShop(res);
    const { conditions, values } = buildListFilters(shop, req.query);
    const orderClause = buildOrderClause(req.query);

    const records = await fetchInfluencerRecordsForExport(
      shop,
      conditions,
      values,
      orderClause
    );

    const useSpreadsheetFormat = req.query.format === 'spreadsheet';
    const csv = useSpreadsheetFormat
      ? exportSponsorshipCsv(records)
      : exportInfluencersCsv(records);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${useSpreadsheetFormat ? 'sponsorship-progress-tracking' : 'influencers'}.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error('Failed to export sponsorship CSV:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to export sponsorship CSV',
    });
  }
});

router.post('/import-csv', async (req, res) => {
  const client = await pool.connect();

  try {
    const shop = getShop(res);
    const csvText = String(req.body.csv || '');

    if (!csvText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'CSV content is required',
      });
    }

    const records = parseSponsorshipCsv(csvText);

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid rows found in CSV',
      });
    }

    await client.query('BEGIN');

    const imported = [];

    for (const record of records) {
      const payload = buildRecordPayload(record);
      const rowValues = influencerRowValues(payload);

      const result = await client.query(
        `
          INSERT INTO influencers (
            shop,
            name,
            business_name,
            first_name,
            last_name,
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
            followers_verified_by,
            niche_category,
            bio,
            tags,
            manager_owner
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
          RETURNING id
        `,
        [shop, ...rowValues]
      );

      const influencerId = result.rows[0].id;
      await saveMonthlyProgress(client, influencerId, shop, payload.monthly_progress);
      imported.push(influencerId);
    }

    await client.query('COMMIT');
    invalidateShop(shop);

    res.json({
      success: true,
      message: `Imported ${imported.length} sponsorship record(s) successfully`,
      count: imported.length,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to import sponsorship CSV:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to import sponsorship CSV',
    });
  } finally {
    client.release();
  }
});

router.post('/bulk-delete', async (req, res) => {
  try {
    const shop = getShop(res);
    const rawIds = req.body.ids;

    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Field "ids" must be a non-empty array',
      });
    }

    const ids = rawIds
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => !Number.isNaN(value));

    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid record IDs provided',
      });
    }

    const result = await pool.query(
      'DELETE FROM influencers WHERE shop = $1 AND id = ANY($2::int[]) RETURNING id',
      [shop, ids]
    );

    console.log(`Bulk deleted ${result.rowCount} record(s), shop=${shop}`);
    invalidateShop(shop);

    res.json({
      success: true,
      message: `Deleted ${result.rowCount} creator record(s) successfully`,
      count: result.rowCount,
    });
  } catch (err) {
    console.error('Failed to bulk delete records:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete records',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const shop = getShop(res);
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID',
      });
    }

    const record = await fetchInfluencerRecord(id, shop);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    console.error('Failed to fetch sponsorship record:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsorship record',
    });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const shop = getShop(res);
    const payload = applyFollowerVerification(null, buildRecordPayload(req.body), res);
    const rowValues = influencerRowValues(payload);

    await client.query('BEGIN');

    const result = await client.query(
      `
        INSERT INTO influencers (
          shop,
          name,
          business_name,
          first_name,
          last_name,
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
          followers_verified_by,
          niche_category,
          bio,
          tags,
          manager_owner
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
        RETURNING ${INFLUENCER_RETURNING_COLUMNS.replace(/\s+/g, ' ').trim()}
      `,
      [shop, ...rowValues]
    );

    const influencerId = result.rows[0].id;
    await saveMonthlyProgress(client, influencerId, shop, payload.monthly_progress);
    await client.query('COMMIT');
    invalidateShop(shop);

    const record = composeEnrichedRecord(result.rows[0], payload.monthly_progress);

    console.log(`Sponsorship record created: id=${influencerId}, shop=${shop}`);

    res.status(201).json({
      success: true,
      message: 'Sponsorship record created successfully',
      data: record,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to create sponsorship record:', err.message);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : 'Failed to create sponsorship record',
    });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    const shop = getShop(res);
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID',
      });
    }

    const existingRow = await fetchInfluencerRow(id, shop);

    if (!existingRow) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    const existingMonthlyProgress =
      req.body.monthly_progress === undefined
        ? await fetchMonthlyProgress(id, shop)
        : normalizeMonthlyProgress(req.body.monthly_progress);
    const existing = composeEnrichedRecord(existingRow, existingMonthlyProgress);

    const payload = applyFollowerVerification(
      existing,
      buildRecordPayload(req.body, existing),
      res
    );
    const rowValues = influencerRowValues(payload);

    await client.query('BEGIN');

    const updateResult = await client.query(
      `
        UPDATE influencers
        SET
          name = $1,
          business_name = $2,
          first_name = $3,
          last_name = $4,
          channel = $5,
          sponsored_products = $6,
          affiliate_code = $7,
          commission = $8,
          order_numbers = $9,
          required_deliverables = $10,
          email = $11,
          region = $12,
          status = $13,
          notes = $14,
          youtube_url = $15,
          facebook_url = $16,
          instagram_url = $17,
          tiktok_url = $18,
          youtube_followers = $19,
          facebook_followers = $20,
          instagram_followers = $21,
          tiktok_followers = $22,
          total_followers = $23,
          ambassador_level = $24,
          contract_status = $25,
          last_contacted_at = $26,
          next_followup_at = $27,
          followers_last_verified_at = $28,
          followers_verified_by = $29,
          niche_category = $30,
          bio = $31,
          tags = $32,
          manager_owner = $33,
          updated_at = NOW()
        WHERE id = $34 AND shop = $35
        RETURNING ${INFLUENCER_RETURNING_COLUMNS.replace(/\s+/g, ' ').trim()}
      `,
      [...rowValues, id, shop]
    );

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    await saveMonthlyProgress(client, id, shop, payload.monthly_progress);
    await client.query('COMMIT');
    invalidateShop(shop);

    const record = composeEnrichedRecord(updateResult.rows[0], payload.monthly_progress);

    console.log(`Sponsorship record updated: id=${id}, shop=${shop}`);

    res.json({
      success: true,
      message: 'Sponsorship record updated successfully',
      data: record,
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Transaction may not have started.
    }
    console.error('Failed to update sponsorship record:', err.message);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : 'Failed to update sponsorship record',
    });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const shop = getShop(res);
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID',
      });
    }

    const result = await pool.query(
      'DELETE FROM influencers WHERE id = $1 AND shop = $2 RETURNING id',
      [id, shop]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    console.log(`Sponsorship record deleted: id=${id}, shop=${shop}`);
    invalidateShop(shop);

    res.json({
      success: true,
      message: 'Sponsorship record deleted successfully',
    });
  } catch (err) {
    console.error('Failed to delete sponsorship record:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sponsorship record',
    });
  }
});

module.exports = router;
