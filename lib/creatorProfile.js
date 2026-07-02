function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeOptionalUrl(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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

function applyCreatorAutomation(data) {
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

function mergeProfileFields(existing, body) {
  return {
    email: body.email !== undefined ? body.email : existing.email,
    region: body.region !== undefined ? body.region : existing.region,
    status: body.status !== undefined ? body.status : existing.status,
    notes: body.notes !== undefined ? body.notes : existing.notes,
    youtube_url:
      body.youtube_url !== undefined ? body.youtube_url : existing.youtube_url,
    facebook_url:
      body.facebook_url !== undefined ? body.facebook_url : existing.facebook_url,
    instagram_url:
      body.instagram_url !== undefined ? body.instagram_url : existing.instagram_url,
    tiktok_url: body.tiktok_url !== undefined ? body.tiktok_url : existing.tiktok_url,
    youtube_followers:
      body.youtube_followers !== undefined
        ? body.youtube_followers
        : existing.youtube_followers,
    facebook_followers:
      body.facebook_followers !== undefined
        ? body.facebook_followers
        : existing.facebook_followers,
    instagram_followers:
      body.instagram_followers !== undefined
        ? body.instagram_followers
        : existing.instagram_followers,
    tiktok_followers:
      body.tiktok_followers !== undefined
        ? body.tiktok_followers
        : existing.tiktok_followers,
    contract_status:
      body.contract_status !== undefined
        ? body.contract_status
        : existing.contract_status,
    last_contacted_at:
      body.last_contacted_at !== undefined
        ? body.last_contacted_at
        : existing.last_contacted_at,
    next_followup_at:
      body.next_followup_at !== undefined
        ? body.next_followup_at
        : existing.next_followup_at,
  };
}

function normalizeProfilePayload(profile) {
  return applyCreatorAutomation({
    email: profile.email ?? null,
    region: profile.region ?? null,
    status: profile.status ?? 'Active Ambassador',
    notes: profile.notes ?? null,
    youtube_url: normalizeOptionalUrl(profile.youtube_url),
    facebook_url: normalizeOptionalUrl(profile.facebook_url),
    instagram_url: normalizeOptionalUrl(profile.instagram_url),
    tiktok_url: normalizeOptionalUrl(profile.tiktok_url),
    youtube_followers: profile.youtube_followers ?? 0,
    facebook_followers: profile.facebook_followers ?? 0,
    instagram_followers: profile.instagram_followers ?? 0,
    tiktok_followers: profile.tiktok_followers ?? 0,
    contract_status: profile.contract_status ?? null,
    last_contacted_at: profile.last_contacted_at ?? null,
    next_followup_at: profile.next_followup_at ?? null,
  });
}

module.exports = {
  applyCreatorAutomation,
  mergeProfileFields,
  normalizeProfilePayload,
  normalizeOptionalUrl,
};
