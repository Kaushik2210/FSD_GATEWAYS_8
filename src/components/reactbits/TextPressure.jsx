import { useEffect, useRef } from "react";
import gsap from "gsap";

// React-Bits-style "Text Pressure" — characters react to cursor proximity.
// The original drives real variable-font weight/width axes; without
// shipping a variable font file, this approximates the same "pressure"
// feel with per-character scale, letter-squeeze and glow instead.
export default function TextPressure({
  text = "Text",
  fontSize = 48,
  color = "#ffffff",
  glowColor = "#38f2ff",
  radius = 140,
  className = "",
}) {
  const containerRef = useRef(null);
  const charRefs = useRef([]);
  const rectsRef = useRef([]);
  const quickRefs = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return undefined;

    quickRefs.current = charRefs.current.map((el) =>
      el
        ? {
            scale: gsap.quickTo(el, "scale", { duration: 0.35, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" }),
          }
        : null
    );

    const measure = () => {
      rectsRef.current = charRefs.current.map((el) => (el ? el.getBoundingClientRect() : null));
    };
    measure();

    const onMove = (e) => {
      rectsRef.current.forEach((rect, i) => {
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const pressure = Math.max(0, 1 - dist / radius);
        const q = quickRefs.current[i];
        if (!q) return;
        q.scale(1 + pressure * 0.55);
        q.y(-pressure * 6);
        charRefs.current[i].style.textShadow = pressure > 0.05 ? `0 0 ${18 * pressure}px ${glowColor}` : "none";
      });
    };

    const onLeave = () => {
      charRefs.current.forEach((el, i) => {
        const q = quickRefs.current[i];
        if (!q) return;
        q.scale(1);
        q.y(0);
        if (el) el.style.textShadow = "none";
      });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [text, radius, glowColor]);

  return (
    <div
      ref={containerRef}
      className={`select-none font-display uppercase ${className}`}
      style={{ fontSize, color, fontWeight: 700, lineHeight: 1.1 }}
    >
      {text.split("").map((ch, i) => (
        <span
          key={i}
          ref={(el) => (charRefs.current[i] = el)}
          className="inline-block will-change-transform"
          style={{ display: "inline-block" }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </div>
  );
}
