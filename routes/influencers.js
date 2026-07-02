const express = require('express');
const { pool } = require('../db');
const {
  parseSponsorshipCsv,
  exportSponsorshipCsv,
  emptyMonthlyProgress,
  cleanCell,
} = require('../lib/sponsorshipCsv');
const {
  mergeProfileFields,
  normalizeProfilePayload,
} = require('../lib/creatorProfile');

const router = express.Router();

const INFLUENCER_ROW_SELECT = `
  i.id,
  i.name,
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
  i.next_followup_at
`;

const SORT_COLUMNS = {
  name: 'i.name',
  channel: 'i.channel',
  affiliate_code: 'i.affiliate_code',
  commission: 'i.commission',
  status: 'i.status',
  ambassador_level: 'i.ambassador_level',
  total_followers: 'i.total_followers',
  id: 'i.id',
};

function getShop(res) {
  return res.locals.shopify.session.shop;
}

function buildOrderClause(query) {
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
    values.push(ambassador_level);
    conditions.push(`i.ambassador_level = $${values.length}`);
  }

  if (query.due_followup === 'true') {
    conditions.push(
      `i.next_followup_at IS NOT NULL AND i.next_followup_at <= NOW() + INTERVAL '7 days'`
    );
  }

  return { conditions, values };
}

function influencerRowValues(payload) {
  return [
    payload.name,
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
  const name = cleanCell(body.name ?? existing.name);

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
    channel: cleanCell(body.channel ?? existing.channel),
    sponsored_products: cleanCell(body.sponsored_products ?? existing.sponsored_products),
    affiliate_code: cleanCell(body.affiliate_code ?? existing.affiliate_code),
    commission: cleanCell(body.commission ?? existing.commission),
    order_numbers: cleanCell(body.order_numbers ?? existing.order_numbers),
    required_deliverables: cleanCell(
      body.required_deliverables ?? existing.required_deliverables
    ),
    ...profile,
    monthly_progress: normalizeMonthlyProgress(
      body.monthly_progress ?? existing.monthly_progress
    ),
  };
}

async function fetchMonthlyProgress(influencerId, shop) {
  const result = await pool.query(
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

async function fetchInfluencerRecord(id, shop) {
  const result = await pool.query(
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

  const record = result.rows[0];
  record.monthly_progress = await fetchMonthlyProgress(id, shop);
  return record;
}

async function saveMonthlyProgress(client, influencerId, shop, monthlyProgress) {
  await client.query(
    'DELETE FROM influencer_monthly_progress WHERE influencer_id = $1 AND shop = $2',
    [influencerId, shop]
  );

  for (const period of monthlyProgress) {
    const hasValues =
      period.monthly_check_in || period.content_delivered || period.link;

    if (!hasValues) {
      continue;
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
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        influencerId,
        shop,
        period.period_index,
        period.monthly_check_in,
        period.content_delivered,
        period.link,
      ]
    );
  }
}

router.get('/stats/summary', async (req, res) => {
  try {
    const shop = getShop(res);
    const result = await pool.query(
      `
        SELECT
          COUNT(*)::INT AS total,
          COUNT(*) FILTER (
            WHERE status IN ('Active Ambassador', 'Partnered')
          )::INT AS partnered,
          COUNT(*) FILTER (
            WHERE ambassador_level IN ('Level 2', 'Level 3')
          )::INT AS elevated_levels,
          COUNT(*) FILTER (
            WHERE next_followup_at IS NOT NULL
              AND next_followup_at <= NOW() + INTERVAL '7 days'
          )::INT AS followups_due_7d,
          COUNT(*) FILTER (
            WHERE affiliate_code IS NOT NULL AND affiliate_code <> ''
          )::INT AS with_affiliate_code,
          COUNT(*) FILTER (WHERE commission = 'YES')::INT AS with_commission,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM influencer_monthly_progress mp
              WHERE mp.influencer_id = influencers.id
                AND mp.shop = influencers.shop
                AND (
                  mp.content_delivered IS NOT NULL
                  OR mp.link IS NOT NULL
                )
            )
          )::INT AS with_content_logged
        FROM influencers
        WHERE shop = $1
      `,
      [shop]
    );

    res.json({ success: true, data: result.rows[0] });
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

    const records = await Promise.all(
      result.rows.map(async (row) => {
        row.monthly_progress = await fetchMonthlyProgress(row.id, shop);
        return row;
      })
    );

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

router.get('/export/csv', async (req, res) => {
  try {
    const shop = getShop(res);
    const { conditions, values } = buildListFilters(shop, req.query);
    const orderClause = buildOrderClause(req.query);

    const result = await pool.query(
      `
        SELECT id
        FROM influencers i
        WHERE ${conditions.join(' AND ')}
        ${orderClause}
      `,
      values
    );

    const records = await Promise.all(
      result.rows.map((row) => fetchInfluencerRecord(row.id, shop))
    );

    const csv = exportSponsorshipCsv(records);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="sponsorship-progress-tracking.csv"'
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
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
          RETURNING id
        `,
        [shop, ...rowValues]
      );

      const influencerId = result.rows[0].id;
      await saveMonthlyProgress(client, influencerId, shop, payload.monthly_progress);
      imported.push(influencerId);
    }

    await client.query('COMMIT');

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
    const payload = buildRecordPayload(req.body);
    const rowValues = influencerRowValues(payload);

    await client.query('BEGIN');

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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
        RETURNING id
      `,
      [shop, ...rowValues]
    );

    const influencerId = result.rows[0].id;
    await saveMonthlyProgress(client, influencerId, shop, payload.monthly_progress);
    await client.query('COMMIT');

    const record = await fetchInfluencerRecord(influencerId, shop);

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

    const existing = await fetchInfluencerRecord(id, shop);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship record not found',
      });
    }

    const payload = buildRecordPayload({ ...existing, ...req.body });
    const rowValues = influencerRowValues(payload);

    await client.query('BEGIN');

    await client.query(
      `
        UPDATE influencers
        SET
          name = $1,
          channel = $2,
          sponsored_products = $3,
          affiliate_code = $4,
          commission = $5,
          order_numbers = $6,
          required_deliverables = $7,
          email = $8,
          region = $9,
          status = $10,
          notes = $11,
          youtube_url = $12,
          facebook_url = $13,
          instagram_url = $14,
          tiktok_url = $15,
          youtube_followers = $16,
          facebook_followers = $17,
          instagram_followers = $18,
          tiktok_followers = $19,
          total_followers = $20,
          ambassador_level = $21,
          contract_status = $22,
          last_contacted_at = $23,
          next_followup_at = $24
        WHERE id = $25 AND shop = $26
      `,
      [...rowValues, id, shop]
    );

    await saveMonthlyProgress(client, id, shop, payload.monthly_progress);
    await client.query('COMMIT');

    const record = await fetchInfluencerRecord(id, shop);

    console.log(`Sponsorship record updated: id=${id}, shop=${shop}`);

    res.json({
      success: true,
      message: 'Sponsorship record updated successfully',
      data: record,
    });
  } catch (err) {
    await client.query('ROLLBACK');
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
