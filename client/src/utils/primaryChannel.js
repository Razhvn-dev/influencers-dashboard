/**
 * Client ESM mirror of lib/primaryChannel.js — keep logic in sync.
 */

const PLATFORM_CHANNELS = [
  { label: 'YouTube', followerField: 'youtube_followers' },
  { label: 'Instagram', followerField: 'instagram_followers' },
  { label: 'Facebook', followerField: 'facebook_followers' },
  { label: 'TikTok', followerField: 'tiktok_followers' },
];

function toFollowerCount(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, parsed);
}

export function derivePrimaryChannelFromFollowers(record) {
  let highestFollowers = 0;
  let primaryChannel = 'Not selected';

  for (const platform of PLATFORM_CHANNELS) {
    const followers = toFollowerCount(record?.[platform.followerField]);
    if (followers > highestFollowers) {
      highestFollowers = followers;
      primaryChannel = platform.label;
    }
  }

  return primaryChannel;
}
