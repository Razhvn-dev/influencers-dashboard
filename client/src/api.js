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
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function fetchInfluencers(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.ambassador_level) params.set('ambassador_level', filters.ambassador_level);
  if (filters.region) params.set('region', filters.region);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;
  const response = await authFetch(url);
  const data = await parseResponse(response);

  return data.data;
}

export async function fetchInfluencer(id) {
  const response = await authFetch(`${API_BASE}/${id}`);
  const data = await parseResponse(response);

  return data.data;
}

export async function createInfluencer(payload) {
  const response = await authFetch(API_BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);

  return data.data;
}

export async function updateInfluencer(id, payload) {
  const response = await authFetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);

  return data.data;
}
