import 'dotenv/config';

const BASE = process.env.SMOKE_BASE || process.env.BASE_URL || 'http://localhost:3000';

async function request(method, path, body, expectJson = true) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!expectJson) {
    return { status: response.status, data: text };
  }
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: response.status, data };
}

const tests = [];

function test(name, pass, detail = '') {
  tests.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  console.log(`Smoke test base: ${BASE}\n`);

  const health = await request('GET', '/health');
  test('Health check', health.status === 200 && health.data.ok === true);

  const stats = await request('GET', '/api/influencers/stats/summary');
  test('Stats summary', stats.status === 200 && stats.data.success, `count fields: ${Object.keys(stats.data.data || {}).length}`);

  const list = await request('GET', '/api/influencers');
  test('List creators', list.status === 200 && list.data.success, `${list.data.count ?? 0} records`);

  const firstId = list.data.data?.[0]?.id;
  if (!firstId) {
    test('Detail record', false, 'no records to test');
  } else {
    const detail = await request('GET', `/api/influencers/${firstId}`);
    test('Detail record', detail.status === 200 && detail.data.data?.id == firstId, `id=${firstId}`);

    const originalName = detail.data.data.name;
    const updatedName = `${originalName} (smoke)`;
    const update = await request('PUT', `/api/influencers/${firstId}`, { name: updatedName });
    test('Update record', update.status === 200 && update.data.success, update.data.message);

    const revert = await request('PUT', `/api/influencers/${firstId}`, { name: originalName });
    test('Revert update', revert.status === 200 && revert.data.data?.name === originalName);

    const create = await request('POST', '/api/influencers', {
      name: `Smoke Test ${Date.now()}`,
      status: 'Applied',
    });
    const createdId = create.data.data?.id;
    test('Create record', create.status === 201 && create.data.success, createdId ? `id=${createdId}` : create.data.message);

    if (createdId) {
      const del = await request('DELETE', `/api/influencers/${createdId}`);
      test('Delete record', del.status === 200 && del.data.success);
    }
  }

  const csv = await request('GET', '/api/influencers/export/csv', null, false);
  test('Export CSV', csv.status === 200 && csv.data.includes('Name,'), `bytes ${csv.data.length}`);

  const passed = tests.filter((t) => t.pass).length;
  console.log(`\n${passed}/${tests.length} passed`);
  process.exit(passed === tests.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
