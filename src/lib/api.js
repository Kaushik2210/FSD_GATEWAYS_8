// In production the API is served from the same domain (Vercel serverless
// function at /api), so a relative path just works. In dev, Vite serves
// the frontend on its own port, so point at the local Express server.
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");

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
