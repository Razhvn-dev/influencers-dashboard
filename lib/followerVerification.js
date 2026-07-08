const { getVerifiedByLabel } = require('./sessionUser');

function followerCountsChanged(existing, updated) {
  const platforms = [
    'youtube_followers',
    'facebook_followers',
    'instagram_followers',
    'tiktok_followers',
  ];

  return platforms.some(
    (field) => Number(existing?.[field] ?? 0) !== Number(updated?.[field] ?? 0)
  );
}

function hasAnyFollowerCounts(payload) {
  return (
    Number(payload?.youtube_followers ?? 0) > 0 ||
    Number(payload?.facebook_followers ?? 0) > 0 ||
    Number(payload?.instagram_followers ?? 0) > 0 ||
    Number(payload?.tiktok_followers ?? 0) > 0
  );
}

function applyFollowerVerification(existing, payload, res) {
  const changed = existing
    ? followerCountsChanged(existing, payload)
    : hasAnyFollowerCounts(payload);

  if (!changed) {
    return {
      ...payload,
      followers_last_verified_at: existing?.followers_last_verified_at ?? null,
      followers_verified_by: existing?.followers_verified_by ?? null,
    };
  }

  return {
    ...payload,
    followers_last_verified_at: new Date().toISOString(),
    followers_verified_by: getVerifiedByLabel(res),
  };
}

module.exports = {
  applyFollowerVerification,
  followerCountsChanged,
  hasAnyFollowerCounts,
};
