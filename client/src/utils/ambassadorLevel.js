/**
 * Client ESM mirror of lib/ambassadorLevel.js — keep logic in sync.
 */

export const AMBASSADOR_LEVEL_RULES = [
  { minFollowers: 1_000_000, label: 'Ambassador 3', rank: 4 },
  { minFollowers: 500_000, label: 'Ambassador 2', rank: 3 },
  { minFollowers: 100_000, label: 'Ambassador 1', rank: 2 },
  { minFollowers: 0, label: 'Creator Sponsorship', rank: 1 },
];

export const ELEVATED_MIN_FOLLOWERS = 100_000;

export function computeAmbassadorLevelFromFollowers(totalFollowers) {
  const count = Number(totalFollowers) || 0;

  for (const rule of AMBASSADOR_LEVEL_RULES) {
    if (count >= rule.minFollowers) {
      return rule.label;
    }
  }

  return 'Creator Sponsorship';
}

export function getAmbassadorLevelRank(level) {
  const match = AMBASSADOR_LEVEL_RULES.find((rule) => rule.label === level);
  return match?.rank ?? 0;
}

export function enrichInfluencerRecord(record) {
  if (!record) return record;

  return {
    ...record,
    ambassador_level: computeAmbassadorLevelFromFollowers(record.total_followers),
  };
}

export function isElevatedAmbassadorLevel(level) {
  return getAmbassadorLevelRank(level) >= 2;
}
