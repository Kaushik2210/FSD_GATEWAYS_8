import "dotenv/config";
import { connectDb } from "./config/db.js";
import Event from "./models/Event.js";

const biomeGlow = {
  cyber: "#38f2ff",
  library: "#ff8a3d",
  nether: "#ff3ec9",
  cherry: "#ff9ecf",
  end: "#b96bff",
  mountain: "#6bff6b",
  crystal: "#4fd6ff",
};

// Kept in sync with src/data/events.js — the frontend's static fallback.
const events = [
  {
    id: "hackathon",
    title: "Hackathon",
    tagline: "48 hours in the Cyber Biome",
    description:
      "Squad up and build something wild in a neon server-farm biome. Mentors roam the grid, prizes glow at the finish line.",
    biome: "cyber",
    date: "Aug 14",
    time: "9:00 AM",
    glow: biomeGlow.cyber,
    height: "lg",
  },
  {
    id: "workshop",
    title: "Workshop Series",
    tagline: "Deep dives in the Ancient Library",
    description:
      "Hands-on sessions on AI, design, and dev tools, hosted in a floating library stacked with glowing bookshelves.",
    biome: "library",
    date: "Aug 16",
    time: "11:00 AM",
    glow: biomeGlow.library,
    height: "sm",
  },
  {
    id: "gaming",
    title: "Gaming Arena",
    tagline: "Enter the Nether arena",
    description:
      "Bracket-style tournaments across your favorite titles, staged over a river of glowing lava and obsidian pillars.",
    biome: "nether",
    date: "Aug 18",
    time: "4:00 PM",
    glow: biomeGlow.nether,
    height: "md",
  },
  {
    id: "music",
    title: "Music Night",
    tagline: "Cherry Blossom stage",
    description:
      "Live sets under a canopy of drifting cherry petals, with a stage that pulses in time with the bass.",
    biome: "cherry",
    date: "Aug 19",
    time: "7:00 PM",
    glow: biomeGlow.cherry,
    height: "lg",
  },
  {
    id: "ai-summit",
    title: "AI Summit",
    tagline: "Transmissions from the End",
    description:
      "Talks and panels on the frontier of AI, staged around a floating end crystal above an obsidian void.",
    biome: "end",
    date: "Aug 20",
    time: "10:00 AM",
    glow: biomeGlow.end,
    height: "md",
  },
  {
    id: "sports",
    title: "Sports Fest",
    tagline: "Peaks of the Mountain Biome",
    description:
      "A full day of campus sports, capped off with a beacon-lit summit ceremony for every winning team.",
    biome: "mountain",
    date: "Aug 21",
    time: "8:00 AM",
    glow: biomeGlow.mountain,
    height: "sm",
  },
  {
    id: "photography",
    title: "Photography Walk",
    tagline: "Through the Crystal Caves",
    description:
      "A guided shoot through a glittering amethyst cave, chasing the best light for your portfolio.",
    biome: "crystal",
    date: "Aug 22",
    time: "5:30 PM",
    glow: biomeGlow.crystal,
    height: "md",
  },
  {
    id: "coding-contest",
    title: "Coding Contest",
    tagline: "Speedrun the Cyber Biome",
    description:
      "A timed competitive-programming gauntlet — DSA, algorithms, and optimization rounds against the clock, with a live leaderboard glowing on the arena wall.",
    biome: "cyber",
    date: "Aug 15",
    time: "10:00 AM",
    glow: biomeGlow.cyber,
    height: "md",
  },
  {
    id: "robotics",
    title: "Robotics Expo",
    tagline: "Built in the Crystal Caves",
    description:
      "Line-followers, combat bots, and autonomous rigs face off on obstacle courses carved from glowing amethyst.",
    biome: "crystal",
    date: "Aug 17",
    time: "1:00 PM",
    glow: biomeGlow.crystal,
    height: "lg",
  },
  {
    id: "cyber-ctf",
    title: "Cybersecurity CTF",
    tagline: "Breach the Nether vault",
    description:
      "Capture-the-flag across web, crypto, and reverse-engineering challenges, staged in a lava-lit vault guarded by obsidian.",
    biome: "nether",
    date: "Aug 18",
    time: "9:00 AM",
    glow: biomeGlow.nether,
    height: "sm",
  },
  {
    id: "app-dev-sprint",
    title: "App Dev Sprint",
    tagline: "24 hours in the Library",
    description:
      "Ship a working product from idea to demo in a single sitting, with docs, APIs, and mentors stacked floor to ceiling.",
    biome: "library",
    date: "Aug 19",
    time: "9:00 AM",
    glow: biomeGlow.library,
    height: "md",
  },
  {
    id: "tech-quiz",
    title: "Tech Quiz",
    tagline: "Trivia from the End",
    description:
      "Buzzer rounds on computer science, internet culture, and startup lore, staged around the floating end crystal.",
    biome: "end",
    date: "Aug 20",
    time: "3:00 PM",
    glow: biomeGlow.end,
    height: "sm",
  },
];

await connectDb();
for (const event of events) {
  // eslint-disable-next-line no-await-in-loop
  await Event.findOneAndUpdate({ id: event.id }, event, { upsert: true, new: true });
}
console.log(`[seed] upserted ${events.length} events`);
process.exit(0);
