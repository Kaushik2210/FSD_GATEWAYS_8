// DEMO-MODE one-time-password flow.
//
// OTPs are generated, expired, and verified for real by the Express +
// MongoDB backend in server/ (see server/src/routes/otp.routes.js). There is
// still no real email/SMS provider wired up, so the backend hands the code
// back in the response instead of delivering it — the UI then surfaces it
// directly, which keeps the flow fully testable end to end without a paid
// delivery account.

import { apiPost } from "./api";

// key: `${channel}:${destination}` where channel is "email" | "tel"
export async function requestOtp(key) {
  const [channel, destination] = key.split(/:(.*)/s);
  return apiPost("/otp/send", { channel, destination });
}

export async function checkOtp(key, code) {
  const [channel, destination] = key.split(/:(.*)/s);
  const { result } = await apiPost("/otp/verify", { channel, destination, code });
  return result;
}
