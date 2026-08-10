import { Router } from "express";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../lib/mailer.js";

const OTP_TTL_MS = 90_000;
const RESEND_COOLDOWN_S = 30;

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const router = Router();

// Demo-mode delivery: if SMTP isn't configured, the code is returned in
// the response instead of actually being emailed.
router.post("/send", async (req, res) => {
  const { channel, destination } = req.body || {};
  if (channel !== "email" || !destination) {
    return res.status(400).json({ error: "channel must be 'email' and destination is required" });
  }
  const key = `${channel}:${String(destination).trim().toLowerCase()}`;

  const existing = await Otp.findOne({ key });
  if (existing) {
    const cooldownRemainingS = Math.ceil((existing.lastSentAt.getTime() + RESEND_COOLDOWN_S * 1000 - Date.now()) / 1000);
    if (cooldownRemainingS > 0) {
      return res.status(429).json({ error: "cooldown", cooldownRemainingS });
    }
  }

  const code = randomCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);
  await Otp.findOneAndUpdate(
    { key },
    { key, code, expiresAt, lastSentAt: now },
    { upsert: true }
  );

  let delivered = false;
  try {
    ({ delivered } = await sendOtpEmail(destination, code));
  } catch (err) {
    console.error("[otp] email send failed:", err.message);
  }

  // Real delivery configured and succeeded: don't hand the code back to the client.
  if (delivered) {
    return res.json({ demo: false, delivered: true, resendCooldownS: RESEND_COOLDOWN_S });
  }
  res.json({ demo: true, delivered: false, code, resendCooldownS: RESEND_COOLDOWN_S });
});

router.post("/verify", async (req, res) => {
  const { channel, destination, code } = req.body || {};
  if (channel !== "email" || !destination || !code) {
    return res.status(400).json({ error: "channel must be 'email', destination and code are required" });
  }
  const key = `${channel}:${String(destination).trim().toLowerCase()}`;

  const entry = await Otp.findOne({ key });
  if (!entry) return res.json({ result: "not_found" });
  if (Date.now() > entry.expiresAt.getTime()) {
    await Otp.deleteOne({ key });
    return res.json({ result: "expired" });
  }
  if (entry.code !== String(code).trim()) {
    return res.json({ result: "mismatch" });
  }
  await Otp.deleteOne({ key });
  res.json({ result: "ok" });
});

export default router;
