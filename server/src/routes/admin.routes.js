import { Router } from "express";
import crypto from "crypto";

const router = Router();

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Exchanges a username/password for the admin key used by GET
// /api/registrations, so the frontend login form never needs the raw key
// hardcoded or pasted in by hand.
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const { ADMIN_USER, ADMIN_PASS, ADMIN_KEY } = process.env;

  if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_KEY) {
    return res.status(503).json({ error: "Admin login isn't configured on this deployment" });
  }
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }
  if (!safeEqual(username, ADMIN_USER) || !safeEqual(password, ADMIN_PASS)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json({ adminKey: ADMIN_KEY });
});

export default router;
