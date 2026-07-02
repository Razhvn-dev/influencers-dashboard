const API_BASE = '/api/influencers';

let sessionTokenFetcher = null;

export function setSessionTokenFetcher(fetcher) {
  sessionTokenFetcher = fetcher;
}

async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (sessionTokenFetcher) {
    const token = await sessionTokenFetcher();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

async function parseResponse(response) {
  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('text/csv')) {
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    return response.text();
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function buildFilterParams(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.affiliate_code) params.set('affiliate_code', filters.affiliate_code);
  if (filters.commission) params.set('commission', filters.commission);
  if (filters.status) params.set('status', filters.status);
  if (filters.ambassador_level) params.set('ambassador_level', filters.ambassador_level);
  if (filters.due_followup) params.set('due_followup', 'true');
  if (filters.sort_by) params.set('sort_by', filters.sort_by);
  if (filters.sort_dir) params.set('sort_dir', filters.sort_dir);

  return params;
}

export async function fetchSponsorshipStats() {
  const response = await authFetch(`${API_BASE}/stats/summary`);
  const data = await parseResponse(response);
  return data.data;
}

export async function fetchSponsorshipRecords(filters = {}) {
  const params = buildFilterParams(filters);
  const query = params.toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;
  const response = await authFetch(url);
  const data = await parseResponse(response);
  return data.data;
}

export async function fetchSponsorshipRecord(id) {
  const response = await authFetch(`${API_BASE}/${id}`);
  const data = await parseResponse(response);
  return data.data;
}

export async function createSponsorshipRecord(payload) {
  const response = await authFetch(API_BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data.data;
}

export async function updateSponsorshipRecord(id, payload) {
  const response = await authFetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data.data;
}

export async function deleteSponsorshipRecord(id) {
  const response = await authFetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return parseResponse(response);
}

export async function importSponsorshipCsv(csvText) {
  const response = await authFetch(`${API_BASE}/import-csv`, {
    method: 'POST',
    body: JSON.stringify({ csv: csvText }),
  });
  return parseResponse(response);
}

export async function exportSponsorshipCsv(filters = {}) {
  const params = buildFilterParams(filters);
  const query = params.toString();
  const url = query ? `${API_BASE}/export/csv?${query}` : `${API_BASE}/export/csv`;
  const response = await authFetch(url);
  return parseResponse(response);
}

// Backward-compatible aliases used by existing components during transition
export const fetchInfluencerStats = fetchSponsorshipStats;
export const fetchInfluencers = fetchSponsorshipRecords;
export const fetchInfluencer = fetchSponsorshipRecord;
export const createInfluencer = createSponsorshipRecord;
export const updateInfluencer = updateSponsorshipRecord;
export const deleteInfluencer = deleteSponsorshipRecord;
