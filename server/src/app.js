import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.routes.js";
import otpRouter from "./routes/otp.routes.js";
import registrationsRouter from "./routes/registrations.routes.js";
import adminRouter from "./routes/admin.routes.js";

export function createApp() {
  const app = express();

  // In production the frontend and this API are served from the same
  // Vercel deployment (same-origin), so the browser never even sends a
  // CORS preflight for it. This mainly matters for local dev, where the
  // Vite dev server runs on a different port — reflect the request origin
  // so it works whether you're on localhost or a real deployed domain.
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/events", eventsRouter);
  app.use("/api/otp", otpRouter);
  app.use("/api/registrations", registrationsRouter);
  app.use("/api/admin", adminRouter);

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
