import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/server/mailer";

const OTP_TTL_MS = 90_000;
const RESEND_COOLDOWN_S = 30;

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Demo-mode delivery: if SMTP isn't configured, the code is returned in
// the response instead of actually being emailed.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { channel, destination } = body || {};
  if (channel !== "email" || !destination) {
    return NextResponse.json({ error: "channel must be 'email' and destination is required" }, { status: 400 });
  }
  const key = `${channel}:${String(destination).trim().toLowerCase()}`;

  await connectDb();
  const existing = await Otp.findOne({ key });
  if (existing) {
    const cooldownRemainingS = Math.ceil((existing.lastSentAt.getTime() + RESEND_COOLDOWN_S * 1000 - Date.now()) / 1000);
    if (cooldownRemainingS > 0) {
      return NextResponse.json({ error: "cooldown", cooldownRemainingS }, { status: 429 });
    }
  }

  const code = randomCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);
  await Otp.findOneAndUpdate({ key }, { key, code, expiresAt, lastSentAt: now }, { upsert: true });

  let delivered = false;
  try {
    ({ delivered } = await sendOtpEmail(destination, code));
  } catch (err) {
    console.error("[otp] email send failed:", err.message);
  }

  if (delivered) {
    return NextResponse.json({ demo: false, delivered: true, resendCooldownS: RESEND_COOLDOWN_S });
  }
  return NextResponse.json({ demo: true, delivered: false, code, resendCooldownS: RESEND_COOLDOWN_S });
}
