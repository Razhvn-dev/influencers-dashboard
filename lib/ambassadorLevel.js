const AMBASSADOR_LEVEL_RULES = [
  { minFollowers: 1_000_000, label: 'Ambassador 3', rank: 4 },
  { minFollowers: 500_000, label: 'Ambassador 2', rank: 3 },
  { minFollowers: 100_000, label: 'Ambassador 1', rank: 2 },
  { minFollowers: 0, label: 'Creator Sponsorship', rank: 1 },
];

const ELEVATED_MIN_FOLLOWERS = 100_000;

function computeAmbassadorLevelFromFollowers(totalFollowers) {
  const count = Number(totalFollowers) || 0;

  for (const rule of AMBASSADOR_LEVEL_RULES) {
    if (count >= rule.minFollowers) {
      return rule.label;
    }
  }

  return 'Creator Sponsorship';
}

function getAmbassadorLevelRank(level) {
  const match = AMBASSADOR_LEVEL_RULES.find((rule) => rule.label === level);
  return match?.rank ?? 0;
}

function getAmbassadorLevelFilterCondition(level) {
  switch (level) {
    case 'Creator Sponsorship':
      return 'i.total_followers < 100000';
    case 'Ambassador 1':
      return 'i.total_followers >= 100000 AND i.total_followers < 500000';
    case 'Ambassador 2':
      return 'i.total_followers >= 500000 AND i.total_followers < 1000000';
    case 'Ambassador 3':
      return 'i.total_followers >= 1000000';
    default:
      return null;
  }
}

const AMBASSADOR_LEVEL_ORDER_SQL = `
  CASE
    WHEN i.total_followers >= 1000000 THEN 4
    WHEN i.total_followers >= 500000 THEN 3
    WHEN i.total_followers >= 100000 THEN 2
    ELSE 1
  END
`;

function buildAmbassadorLevelOrderClause(sortDir) {
  const direction = sortDir === 'asc' ? 'ASC' : 'DESC';
  return `ORDER BY ${AMBASSADOR_LEVEL_ORDER_SQL} ${direction}, i.id DESC`;
}

function enrichInfluencerRecord(record) {
  if (!record) return record;

  return {
    ...record,
    ambassador_level: computeAmbassadorLevelFromFollowers(record.total_followers),
  };
}

function isElevatedAmbassadorLevel(level) {
  return getAmbassadorLevelRank(level) >= 2;
}

module.exports = {
  AMBASSADOR_LEVEL_RULES,
  ELEVATED_MIN_FOLLOWERS,
  computeAmbassadorLevelFromFollowers,
  getAmbassadorLevelRank,
  getAmbassadorLevelFilterCondition,
  buildAmbassadorLevelOrderClause,
  enrichInfluencerRecord,
  isElevatedAmbassadorLevel,
};
