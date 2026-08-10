import { Router } from "express";
import Event from "../models/Event.js";

const router = Router();

router.get("/", async (_req, res) => {
  const events = await Event.find().sort({ createdAt: 1 }).lean();
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const event = await Event.findOne({ id: req.params.id }).lean();
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

export default router;
