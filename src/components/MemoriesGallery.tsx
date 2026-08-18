import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DriftWall from "./reactbits/DriftWall";
import { useDriftWallLayout } from "../hooks/useDriftWallLayout";

gsap.registerPlugin(ScrollTrigger);

// Placeholder photography (Lorem Picsum — free, real photos, no scraping or
// hotlinking of anyone's copyrighted Pinterest uploads). Swap the `image`
// for real event photos whenever you have them; captions stay as-is.
const MEMORIES = [
  { seed: "gw-hack-1", title: "Hackathon 2025 — Finalists' demo night", glow: "#38f2ff" },
  { seed: "gw-crowd-1", title: "Opening Ceremony 2025 — Full house", glow: "#a855ff" },
  { seed: "gw-stage-1", title: "Music Night 2024 — Main stage lights", glow: "#ff3ec9" },
  { seed: "gw-work-1", title: "Workshop Series 2025 — AI deep dive", glow: "#ff8a3d" },
  { seed: "gw-game-1", title: "Gaming Arena 2024 — Grand finals", glow: "#ff3ec9" },
  { seed: "gw-team-1", title: "Robotics Expo 2025 — Bot check-in", glow: "#4fd6ff" },
  { seed: "gw-night-1", title: "Closing Night 2024 — Beacon ceremony", glow: "#6bff6b" },
  { seed: "gw-crowd-2", title: "AI Summit 2025 — Panel discussion", glow: "#b96bff" },
  { seed: "gw-sport-1", title: "Sports Fest 2024 — Podium moment", glow: "#6bff6b" },
  { seed: "gw-photo-1", title: "Photography Walk 2025 — Golden hour", glow: "#4fd6ff" },
  { seed: "gw-code-1", title: "Coding Contest 2025 — Final stretch", glow: "#38f2ff" },
  { seed: "gw-ctf-1", title: "Cybersecurity CTF 2025 — Flag captured", glow: "#ff3ec9" },
  { seed: "gw-quiz-1", title: "Tech Quiz 2025 — Buzzer round", glow: "#b96bff" },
  { seed: "gw-dev-1", title: "App Dev Sprint 2025 — Ship it", glow: "#ff8a3d" },
  { seed: "gw-crowd-3", title: "Closing Beacon 2025", glow: "#6bff6b" },
];

const ITEMS = MEMORIES.map((m) => ({
  ...m,
  image: `https://picsum.photos/seed/${m.seed}/500/650`,
}));

export default function MemoriesGallery() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const wallWrapRef = useRef(null);
  const [active, setActive] = useState(null);
  const driftLayout = useDriftWallLayout();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        }
      );

      gsap.fromTo(
        wallWrapRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: wallWrapRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section id="memories" ref={sectionRef} className="relative px-6 py-32 md:px-12">
      <div ref={headingRef} className="mx-auto mb-16 max-w-3xl text-center">
        <p className="mb-3 font-display text-xs tracking-[0.4em] text-magenta text-glow-purple uppercase">
          Flashbacks
        </p>
        <h2 className="font-display text-4xl font-bold text-white uppercase md:text-5xl">
          Memories From Past Seasons
        </h2>
        <p className="mt-4 text-white/60">
          A wall of moments from Gateways past — click any frame to relive it.
        </p>
        <p className="mt-2 text-xs text-white/30">
          (Placeholder photography for now — swap in your own event shots any time.)
        </p>
      </div>

      <div ref={wallWrapRef} className="mx-auto max-w-6xl">
        <DriftWall
          items={ITEMS}
          columns={driftLayout.columns}
          tileWidth={driftLayout.tileWidth}
          tileHeight={driftLayout.tileHeight}
          gap={driftLayout.gap}
          radius={16}
          onItemClick={setActive}
        />
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <div className="relative max-h-[85vh] max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActive(null)}
              data-cursor-hover
              className="absolute -top-4 -right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            >
              ✕
            </button>
            <img
              src={active.image}
              alt={active.title}
              className="max-h-[75vh] w-full rounded-2xl object-cover"
              style={{ boxShadow: `0 30px 80px -20px ${active.glow}66` }}
            />
            <p className="mt-3 text-center text-sm text-white/70">{active.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}
