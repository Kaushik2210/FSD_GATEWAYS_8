import { useEffect, useRef } from "react";
import gsap from "gsap";

// React-Bits-style "Drift Wall" — a tilted 3D wall of tiles drifting in
// looping columns, with pointer-follow parallax and a hover lift. No extra
// dependency (pure CSS 3D transforms + GSAP for the parallax/lift).
export default function DriftWall({
  items = [],
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor = "#060010",
  onItemClick,
}) {
  const outerRef = useRef(null);
  const wallRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const wall = wallRef.current;
    if (!outer || !wall) return undefined;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return undefined;

    gsap.set(wall, { rotationX: tilt, rotationY: turn, rotationZ: roll, transformPerspective: perspective });
    const quickX = gsap.quickTo(wall, "rotationY", { duration: 0.6, ease: "power3.out" });
    const quickY = gsap.quickTo(wall, "rotationX", { duration: 0.6, ease: "power3.out" });

    const onMove = (e) => {
      const rect = outer.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(turn + px * 24 * parallax);
      quickY(tilt - py * 20 * parallax);
    };
    const onLeave = () => {
      quickX(turn);
      quickY(tilt);
    };

    outer.addEventListener("mousemove", onMove);
    outer.addEventListener("mouseleave", onLeave);
    return () => {
      outer.removeEventListener("mousemove", onMove);
      outer.removeEventListener("mouseleave", onLeave);
    };
  }, [tilt, turn, roll, perspective, parallax]);

  const cols = Array.from({ length: columns }, (_, i) => items.filter((_, idx) => idx % columns === i));
  const tileStep = tileHeight + gap;

  const onTileEnter = (e) => {
    gsap.to(e.currentTarget, {
      z: lift,
      scale: 1.06,
      filter: grayscale ? "grayscale(0)" : "none",
      duration: 0.4,
      ease: "power3.out",
    });
    const overlay = e.currentTarget.querySelector(".drift-tile-overlay");
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    const img = e.currentTarget.querySelector("img");
    if (img) gsap.to(img, { opacity: 1, duration: 0.3 });
  };
  const onTileLeave = (e) => {
    gsap.to(e.currentTarget, { z: 0, scale: 1, duration: 0.5, ease: "power3.out" });
    const overlay = e.currentTarget.querySelector(".drift-tile-overlay");
    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.4 });
    const img = e.currentTarget.querySelector("img");
    if (img) gsap.to(img, { opacity: dim, duration: 0.4 });
  };

  return (
    <div
      ref={outerRef}
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ perspective, height: tileHeight * 3.1 }}
      onMouseEnter={pauseOnHover ? (e) => (wallRef.current.style.animationPlayState = "paused") : undefined}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `linear-gradient(to bottom, ${overlayColor} 0%, transparent ${fade * 40}%, transparent ${100 - fade * 40}%, ${overlayColor} 100%)`,
        }}
      />
      <div ref={wallRef} className="flex h-full justify-center" style={{ gap, transformStyle: "preserve-3d" }}>
        {cols.map((colItems, ci) => {
          const isAltDirection = ci % 2 === 1;
          const goingUp = isAltDirection ? direction !== "up" : direction === "up";
          const varianceFactor = 1 + (((ci % 3) - 1) * variance) / 1.5;
          const setHeight = colItems.length * tileStep;
          const duration = Math.max(4, (setHeight / speed) * varianceFactor);
          const looped = [...colItems, ...colItems];

          return (
            <div key={ci} className="relative overflow-hidden" style={{ width: tileWidth }}>
              <div
                className="flex flex-col"
                style={{
                  gap,
                  animation: `drift-scroll ${duration}s linear infinite`,
                  animationDirection: goingUp ? "normal" : "reverse",
                }}
              >
                {looped.map((item, ii) => (
                  <button
                    key={`${item.seed || item.image}-${ii}`}
                    type="button"
                    data-cursor-hover
                    onClick={() => onItemClick?.(item)}
                    onMouseEnter={onTileEnter}
                    onMouseLeave={onTileLeave}
                    className="relative block shrink-0 cursor-pointer overflow-hidden p-0"
                    style={{ width: tileWidth, height: tileHeight, borderRadius: radius, transformStyle: "preserve-3d" }}
                  >
                    <img
                      src={item.image}
                      alt={item.title || ""}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ opacity: dim, filter: grayscale ? "grayscale(1)" : "none", transition: "none" }}
                    />
                    <div
                      className="drift-tile-overlay pointer-events-none absolute inset-0"
                      style={{ background: overlayColor, opacity: 0.35 }}
                    />
                    {item.title && (
                      <p className="absolute bottom-2 left-2 z-10 max-w-[85%] font-display text-[10px] tracking-widest text-white uppercase drop-shadow">
                        {item.title}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
