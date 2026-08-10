import { Router } from "express";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

function makeTicketCode(eventId) {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GATE-${eventId.slice(0, 3).toUpperCase()}-${rand}`;
}

const router = Router();

function requireAdmin(req, res, next) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return res.status(503).json({ error: "Admin access isn't configured on this deployment (set ADMIN_KEY)" });
  }
  if (req.get("x-admin-key") !== adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Lists everyone's registration details (name, email, phone, payment ref) —
// gated behind an admin key so this can't be scraped by anyone who finds
// the URL on a publicly deployed site.
router.get("/", requireAdmin, async (req, res) => {
  const { eventId } = req.query;
  const filter = eventId ? { eventId } : {};
  const registrations = await Registration.find(filter).sort({ createdAt: -1 }).lean();
  res.json(registrations);
});

router.post("/", async (req, res) => {
  const { eventId, name, college, course, email, phone, txnId, screenshotName } = req.body || {};

  if (!eventId || !name || !college || !course || !email || !phone || !txnId) {
    return res.status(400).json({ error: "eventId, name, college, course, email, phone and txnId are required" });
  }
  if (!EMAIL_RE.test(String(email).trim())) return res.status(400).json({ error: "Invalid email" });
  if (!PHONE_RE.test(String(phone).trim())) return res.status(400).json({ error: "Invalid phone" });

  const event = await Event.findOne({ id: eventId }).lean();
  if (!event) return res.status(404).json({ error: "Event not found" });

  let ticket;
  for (let attempt = 0; attempt < 5; attempt++) {
    ticket = makeTicketCode(eventId);
    // eslint-disable-next-line no-await-in-loop
    if (!(await Registration.exists({ ticket }))) break;
  }

  const registration = await Registration.create({
    eventId,
    name: String(name).trim(),
    college: String(college).trim(),
    course: String(course).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    ticket,
    txnId: String(txnId).trim(),
    screenshotName,
  });

  res.status(201).json(registration);
});

router.get("/:id", async (req, res) => {
  const registration = await Registration.findById(req.params.id).lean();
  if (!registration) return res.status(404).json({ error: "Registration not found" });
  res.json(registration);
});

export default router;
