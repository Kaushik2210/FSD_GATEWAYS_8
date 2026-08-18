"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import NeonButton from "./NeonButton";

const STORAGE_KEY = "gateways_admin_key";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [eventFilter, setEventFilter] = useState("");
  const [registrations, setRegistrations] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (key) => {
    setLoading(true);
    setLoadError(null);
    try {
      const path = eventFilter ? `/registrations?eventId=${encodeURIComponent(eventFilter)}` : "/registrations";
      const data = await apiGet(path, { "x-admin-key": key });
      setRegistrations(data);
    } catch (err) {
      if (err.status === 401) {
        // Stored key is stale/revoked — drop it and fall back to the login form.
        localStorage.removeItem(STORAGE_KEY);
        setAdminKey("");
      } else {
        setLoadError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) load(adminKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  const login = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const { adminKey: key } = await apiPost("/admin/login", { username, password });
      localStorage.setItem(STORAGE_KEY, key);
      setAdminKey(key);
      setPassword("");
    } catch (err) {
      setLoginError(err.status === 401 ? "Wrong username or password." : err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAdminKey("");
    setRegistrations(null);
    setUsername("");
    setPassword("");
  };

  if (!adminKey) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-void px-6 text-white">
        <form onSubmit={login} className="glass w-full max-w-sm rounded-2xl p-6">
          <h1 className="font-display text-xl font-bold uppercase tracking-widest text-cyan">
            Gateways Admin
          </h1>
          <p className="mt-1 mb-6 text-sm text-white/50">Sign in to view registrations.</p>

          <label htmlFor="admin-username" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
          />

          <label htmlFor="admin-password" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
          />

          {loginError && <p className="mb-4 text-sm text-magenta">{loginError}</p>}

          <NeonButton type="submit" variant="primary">
            {loggingIn ? "Signing in…" : "Sign In"}
          </NeonButton>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-void px-6 py-12 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-cyan">
              Gateways Admin
            </h1>
            <p className="mt-1 text-sm text-white/50">Registration lookup.</p>
          </div>
          <button
            type="button"
            data-cursor-hover
            onClick={logout}
            className="text-xs tracking-widest text-white/50 uppercase hover:text-white"
          >
            Sign Out
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(adminKey);
          }}
          className="glass mt-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="admin-filter" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
              Event ID (optional)
            </label>
            <input
              id="admin-filter"
              type="text"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              placeholder="e.g. hackathon"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan"
            />
          </div>
          <NeonButton type="submit" variant="primary">
            {loading ? "Loading…" : "Refresh"}
          </NeonButton>
        </form>

        {loadError && <p className="mt-4 text-sm text-magenta">{loadError}</p>}

        {registrations && (
          <div className="mt-6">
            <p className="mb-3 text-xs tracking-widest text-white/50 uppercase">
              {registrations.length} registration{registrations.length === 1 ? "" : "s"}
            </p>
            <div className="glass overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs tracking-widest text-white/50 uppercase">
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Txn ID</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r._id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-white/50">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{r.eventId}</td>
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.college}</td>
                      <td className="px-4 py-3">{r.course}</td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">{r.phone}</td>
                      <td className="px-4 py-3 text-cyan">{r.ticket}</td>
                      <td className="px-4 py-3 text-white/50">{r.txnId}</td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-white/40">
                        No registrations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
