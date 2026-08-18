import { useRef, useState } from "react";
import gsap from "gsap";
import BiomeDiorama from "./BiomeDiorama";

const heightClass = {
  sm: "md:mt-0",
  md: "md:mt-10",
  lg: "md:mt-20",
};

export default function EventCard({ event, onOpen }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateY: px * 16,
      rotateX: -py * 16,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 700,
    });
    if (glowRef.current) {
      gsap.to(glowRef.current, { x: px * rect.width, y: py * rect.height, duration: 0.3 });
    }
  };

  const onEnter = () => {
    setHovered(true);
    gsap.to(cardRef.current, {
      y: -14,
      scale: 1.03,
      boxShadow: `0 30px 60px -10px ${event.glow}55`,
      duration: 0.4,
      ease: "power3.out",
    });
    spawnParticles();
  };

  const onLeave = () => {
    setHovered(false);
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.4)",
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const spawnParticles = () => {
    const el = cardRef.current;
    if (!el) return;
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("span");
      p.style.position = "absolute";
      p.style.left = "50%";
      p.style.top = "50%";
      p.style.width = "4px";
      p.style.height = "4px";
      p.style.borderRadius = "9999px";
      p.style.background = event.glow;
      p.style.boxShadow = `0 0 8px ${event.glow}`;
      p.style.pointerEvents = "none";
      p.style.zIndex = "20";
      el.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: 0.9 + Math.random() * 0.4,
        ease: "power2.out",
        onComplete: () => p.remove(),
      });
    }
  };

  return (
    <div
      className={`group ${heightClass[event.height]}`}
      data-cursor-hover
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => onOpen?.(event)}
    >
      <div
        ref={cardRef}
        className="glass relative isolate flex h-80 cursor-pointer flex-col justify-end overflow-hidden rounded-3xl"
        style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.4)" }}
      >
        <div className="absolute inset-0">
          <BiomeDiorama biome={event.biome} color={event.glow} hovered={hovered} />
        </div>

        <div
          ref={glowRef}
          className="pointer-events-none absolute top-0 left-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: event.glow, opacity: 0.25 }}
        />

        <div
          className="pointer-events-none relative z-10 p-6"
          style={{
            background: `linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.55) 60%, transparent 100%)`,
          }}
        >
          <span
            className="mb-2 inline-block w-fit rounded-full px-3 py-1 font-display text-[10px] tracking-widest uppercase"
            style={{ color: event.glow, border: `1px solid ${event.glow}66`, background: `${event.glow}1a` }}
          >
            {event.date} · {event.time}
          </span>
          <h3 className="font-display text-2xl font-semibold text-white">{event.title}</h3>
          <p className="mt-1 text-sm text-white/60">{event.tagline}</p>
        </div>
      </div>
    </div>
  );
}
