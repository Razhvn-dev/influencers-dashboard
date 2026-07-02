const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const WRITABLE_FIELDS = [
  'name',
  'company_name',
  'email',
  'region',
  'status',
  'notes',
  'youtube_followers',
  'facebook_followers',
  'instagram_followers',
  'tiktok_followers',
  'contract_status',
  'products_requested',
  'deliverables',
  'last_contacted_at',
  'next_followup_at',
];

function getShop(res) {
  return res.locals.shopify.session.shop;
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function calculateFollowers(data) {
  const youtube = toInt(data.youtube_followers, 0);
  const facebook = toInt(data.facebook_followers, 0);
  const instagram = toInt(data.instagram_followers, 0);
  const tiktok = toInt(data.tiktok_followers, 0);

  return {
    youtube_followers: youtube,
    facebook_followers: facebook,
    instagram_followers: instagram,
    tiktok_followers: tiktok,
    total_followers: youtube + facebook + instagram + tiktok,
  };
}

function calculateAmbassadorLevel(totalFollowers, youtubeFollowers) {
  if (totalFollowers > 500000 && youtubeFollowers > 100000) {
    return 'Level 3';
  }
  if (totalFollowers > 100000) {
    return 'Level 2';
  }
  return 'Level 1';
}

function applyAutomation(data) {
  const followers = calculateFollowers(data);

  return {
    ...data,
    ...followers,
    ambassador_level: calculateAmbassadorLevel(
      followers.total_followers,
      followers.youtube_followers
    ),
  };
}

function pickWritableFields(source) {
  const result = {};

  for (const field of WRITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      result[field] = source[field];
    }
  }

  return result;
}

function buildInsertPayload(body) {
  const payload = applyAutomation({
    name: body.name,
    company_name: body.company_name ?? null,
    email: body.email ?? null,
    region: body.region ?? null,
    status: body.status ?? 'Contacted',
    notes: body.notes ?? null,
    youtube_followers: body.youtube_followers ?? 0,
    facebook_followers: body.facebook_followers ?? 0,
    instagram_followers: body.instagram_followers ?? 0,
    tiktok_followers: body.tiktok_followers ?? 0,
    contract_status: body.contract_status ?? null,
    products_requested: body.products_requested ?? null,
    deliverables: body.deliverables ?? null,
    last_contacted_at: body.last_contacted_at ?? null,
    next_followup_at: body.next_followup_at ?? null,
  });

  if (!payload.name || !String(payload.name).trim()) {
    const error = new Error('Field "name" is required');
    error.statusCode = 400;
    throw error;
  }

  return payload;
}

function buildUpdatePayload(existing, body) {
  const merged = {
    name: existing.name,
    company_name: existing.company_name,
    email: existing.email,
    region: existing.region,
    status: existing.status,
    notes: existing.notes,
    youtube_followers: existing.youtube_followers,
    facebook_followers: existing.facebook_followers,
    instagram_followers: existing.instagram_followers,
    tiktok_followers: existing.tiktok_followers,
    contract_status: existing.contract_status,
    products_requested: existing.products_requested,
    deliverables: existing.deliverables,
    last_contacted_at: existing.last_contacted_at,
    next_followup_at: existing.next_followup_at,
    ...pickWritableFields(body),
  };

  const payload = applyAutomation(merged);

  if (!payload.name || !String(payload.name).trim()) {
    const error = new Error('Field "name" cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  return payload;
}

router.get('/', async (req, res) => {
  try {
    const shop = getShop(res);
    const { status, ambassador_level, region, search } = req.query;
    const conditions = ['shop = $1'];
    const values = [shop];

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (ambassador_level) {
      values.push(ambassador_level);
      conditions.push(`ambassador_level = $${values.length}`);
    }

    if (region) {
      values.push(region);
      conditions.push(`region = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(name ILIKE $${values.length} OR company_name ILIKE $${values.length})`
      );
    }

    const query = `
      SELECT *
      FROM influencers
      WHERE ${conditions.join(' AND ')}
      ORDER BY id DESC
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    console.error('Failed to fetch influencers:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencers',
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
        message: 'Invalid influencer ID',
      });
    }

    const result = await pool.query(
      'SELECT * FROM influencers WHERE id = $1 AND shop = $2',
      [id, shop]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Failed to fetch influencer details:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencer details',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const shop = getShop(res);
    const payload = buildInsertPayload(req.body);

    const result = await pool.query(
      `
        INSERT INTO influencers (
          shop,
          name,
          company_name,
          email,
          region,
          status,
          notes,
          youtube_followers,
          facebook_followers,
          instagram_followers,
          tiktok_followers,
          total_followers,
          ambassador_level,
          contract_status,
          products_requested,
          deliverables,
          last_contacted_at,
          next_followup_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18
        )
        RETURNING *
      `,
      [
        shop,
        payload.name,
        payload.company_name,
        payload.email,
        payload.region,
        payload.status,
        payload.notes,
        payload.youtube_followers,
        payload.facebook_followers,
        payload.instagram_followers,
        payload.tiktok_followers,
        payload.total_followers,
        payload.ambassador_level,
        payload.contract_status,
        payload.products_requested,
        payload.deliverables,
        payload.last_contacted_at,
        payload.next_followup_at,
      ]
    );

    console.log(
      `Influencer created successfully: id=${result.rows[0].id}, shop=${shop}`
    );

    res.status(201).json({
      success: true,
      message: 'Influencer created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Failed to create influencer:', err.message);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : 'Failed to create influencer',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const shop = getShop(res);
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid influencer ID',
      });
    }

    const existingResult = await pool.query(
      'SELECT * FROM influencers WHERE id = $1 AND shop = $2',
      [id, shop]
    );

    if (existingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found',
      });
    }

    const payload = buildUpdatePayload(existingResult.rows[0], req.body);

    const result = await pool.query(
      `
        UPDATE influencers
        SET
          name = $1,
          company_name = $2,
          email = $3,
          region = $4,
          status = $5,
          notes = $6,
          youtube_followers = $7,
          facebook_followers = $8,
          instagram_followers = $9,
          tiktok_followers = $10,
          total_followers = $11,
          ambassador_level = $12,
          contract_status = $13,
          products_requested = $14,
          deliverables = $15,
          last_contacted_at = $16,
          next_followup_at = $17
        WHERE id = $18 AND shop = $19
        RETURNING *
      `,
      [
        payload.name,
        payload.company_name,
        payload.email,
        payload.region,
        payload.status,
        payload.notes,
        payload.youtube_followers,
        payload.facebook_followers,
        payload.instagram_followers,
        payload.tiktok_followers,
        payload.total_followers,
        payload.ambassador_level,
        payload.contract_status,
        payload.products_requested,
        payload.deliverables,
        payload.last_contacted_at,
        payload.next_followup_at,
        id,
        shop,
      ]
    );

    console.log(`Influencer updated successfully: id=${id}, shop=${shop}`);

    res.json({
      success: true,
      message: 'Influencer updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Failed to update influencer:', err.message);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : 'Failed to update influencer',
    });
  }
});

module.exports = router;
