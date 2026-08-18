// Next.js Route Handlers under src/app/api are always served from the same
// origin as the page, in both dev and production, so a relative path works
// everywhere — no separate backend port to point at.
const BASE_URL = "/api";

type ApiError = Error & { status?: number; data?: any };

async function request(path: string, { headers, ...options }: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...headers },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error: ApiError = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function apiGet(path: string, headers?: HeadersInit) {
  return request(path, { method: "GET", headers });
}

export function apiPost(path: string, body: unknown, headers?: HeadersInit) {
  return request(path, { method: "POST", body: JSON.stringify(body), headers });
}
