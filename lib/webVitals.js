const ALLOWED_METRICS = new Set(['CLS', 'FCP', 'INP', 'LCP', 'TTFB']);

function sanitizeWebVitals(payload) {
  const candidates = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.metrics)
      ? payload.metrics
      : [];

  return candidates
    .filter((metric) => ALLOWED_METRICS.has(metric?.name) && Number.isFinite(Number(metric?.value)))
    .slice(0, ALLOWED_METRICS.size)
    .map((metric) => ({
      name: metric.name,
      value: Math.round(Number(metric.value) * 1000) / 1000,
    }));
}

module.exports = {
  sanitizeWebVitals,
};
