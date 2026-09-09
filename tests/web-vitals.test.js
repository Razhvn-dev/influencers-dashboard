const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeWebVitals } = require('../lib/webVitals');

test('keeps only bounded, non-identifying web vital measurements', () => {
  assert.deepEqual(
    sanitizeWebVitals({
      appId: 'do-not-log',
      metrics: [
        { name: 'LCP', value: 1321.1234 },
        { name: 'invalid', value: 1 },
        { name: 'CLS', value: '0.0155' },
      ],
    }),
    [
      { name: 'LCP', value: 1321.123 },
      { name: 'CLS', value: 0.016 },
    ]
  );
});
