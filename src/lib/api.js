// Next.js Route Handlers under src/app/api are always served from the same
// origin as the page, in both dev and production, so a relative path works
// everywhere — no separate backend port to point at.
const BASE_URL = "/api";

async function request(path, { headers, ...options } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...headers },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function apiGet(path, headers) {
  return request(path, { method: "GET", headers });
}

export function apiPost(path, body, headers) {
  return request(path, { method: "POST", body: JSON.stringify(body), headers });
}
