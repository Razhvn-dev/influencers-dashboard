const cache = new Map();

const DEFAULT_TTL_MS = 30_000;

function getCached(key, ttlMs, loader) {
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && hit.expiresAt > now) {
    return Promise.resolve(hit.value);
  }

  return loader().then((value) => {
    cache.set(key, { value, expiresAt: now + ttlMs });
    return value;
  });
}

function invalidateShop(shop) {
  const prefix = `${shop}:`;

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

module.exports = {
  DEFAULT_TTL_MS,
  getCached,
  invalidateShop,
};
