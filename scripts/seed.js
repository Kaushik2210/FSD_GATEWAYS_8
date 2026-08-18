// Seeds MongoDB with the event catalog. Run with: npm run seed
// Reads MONGODB_URI from .env.local (auto-loaded via Node's built-in
// loadEnvFile — no dotenv dependency needed).
try {
  process.loadEnvFile?.(".env.local");
} catch {
  // .env.local is optional — MONGODB_URI may already be set in the environment.
}

import { connectDb } from "../src/lib/db.js";
import Event from "../src/models/Event.js";
import { events } from "../src/data/events.js";

await connectDb();
for (const event of events) {
  const { id, title, tagline, description, biome, date, time, glow, height } = event;
  // eslint-disable-next-line no-await-in-loop
  await Event.findOneAndUpdate(
    { id },
    { id, title, tagline, description, biome, date, time, glow, height },
    { upsert: true, new: true }
  );
}
console.log(`[seed] upserted ${events.length} events`);
process.exit(0);
