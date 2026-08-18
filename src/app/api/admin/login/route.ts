import { NextResponse } from "next/server";
import crypto from "crypto";

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Exchanges a username/password for the admin key used by GET
// /api/registrations, so the frontend login form never needs the raw key
// hardcoded or pasted in by hand.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { username, password } = body || {};
  const { ADMIN_USER, ADMIN_PASS, ADMIN_KEY } = process.env;

  if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_KEY) {
    return NextResponse.json({ error: "Admin login isn't configured on this deployment" }, { status: 503 });
  }
  if (!username || !password) {
    return NextResponse.json({ error: "username and password are required" }, { status: 400 });
  }
  if (!safeEqual(username, ADMIN_USER) || !safeEqual(password, ADMIN_PASS)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  return NextResponse.json({ adminKey: ADMIN_KEY });
}
