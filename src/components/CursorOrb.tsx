import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorOrb() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { x: pos.x, y: pos.y };
    const ringPos = { x: pos.x, y: pos.y };
    let lastX = pos.x;
    let lastY = pos.y;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const ticker = () => {
      const vx = pos.x - lastX;
      const vy = pos.y - lastY;
      lastX = pos.x;
      lastY = pos.y;
      const speed = Math.min(Math.hypot(vx, vy), 40);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;

      dotPos.x += (pos.x - dotPos.x) * 0.9;
      dotPos.y += (pos.y - dotPos.y) * 0.9;
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;

      gsap.set(dot, { x: dotPos.x, y: dotPos.y });
      gsap.set(ring, {
        x: ringPos.x,
        y: ringPos.y,
        rotate: angle,
        scaleX: 1 + speed / 40,
        scaleY: 1 - speed / 120,
      });
    };
    gsap.ticker.add(ticker);

    const interactiveSelector = "a, button, [data-cursor-hover]";
    const onEnter = (e) => {
      const target = e.target;
      if (target.closest && target.closest(interactiveSelector)) {
        gsap.to(ring, { scale: 1.8, borderColor: "#38f2ff", duration: 0.35, overwrite: "auto" });
        gsap.to(dot, { backgroundColor: "#38f2ff", duration: 0.35, overwrite: "auto" });
      }
    };
    const onLeave = (e) => {
      const target = e.target;
      if (target.closest && target.closest(interactiveSelector)) {
        gsap.to(ring, { scale: 1, borderColor: "#a855ff", duration: 0.35, overwrite: "auto" });
        gsap.to(dot, { backgroundColor: "#a855ff", duration: 0.35, overwrite: "auto" });
      }
    };
    document.addEventListener("pointerover", onEnter);
    document.addEventListener("pointerout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", onEnter);
      document.removeEventListener("pointerout", onLeave);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={ringRef}
        className="absolute top-0 left-0 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: "#a855ff" }}
      />
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: "#a855ff", boxShadow: "0 0 12px #a855ff, 0 0 28px #a855ff" }}
      />
    </div>
  );
}
