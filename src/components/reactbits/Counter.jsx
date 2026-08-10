import { useEffect, useRef } from "react";
import gsap from "gsap";

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

// React-Bits-style "Counter" — odometer digit columns that roll into place.
// Hand-rolled with GSAP instead of the original's `motion` dependency to
// stay on this project's single animation library.
export default function Counter({
  value,
  isVisible = true,
  fontSize = 44,
  textColor = "#ffffff",
  fontWeight = 700,
  className = "",
}) {
  const digits = String(Math.max(0, Math.round(value))).split("").map(Number);
  const digitHeight = fontSize * 1.15;
  const columnRefs = useRef([]);
  const started = useRef(false);

  useEffect(() => {
    if (!isVisible || started.current) return;
    started.current = true;
    columnRefs.current.forEach((col, i) => {
      if (!col) return;
      const target = digits[i];
      gsap.fromTo(
        col,
        { y: -(target + 10) * digitHeight },
        {
          y: -target * digitHeight,
          duration: 1.4 + i * 0.12,
          ease: "power3.out",
          delay: i * 0.05,
        }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <span
      className={`inline-flex overflow-hidden align-middle ${className}`}
      style={{ height: digitHeight, lineHeight: `${digitHeight}px` }}
    >
      {digits.map((_, i) => (
        <span key={i} className="relative overflow-hidden" style={{ width: fontSize * 0.62, height: digitHeight }}>
          <span
            ref={(el) => (columnRefs.current[i] = el)}
            className="absolute inset-x-0 top-0 flex flex-col items-center"
            style={{ transform: `translateY(${-(digits[i] + 10) * digitHeight}px)` }}
          >
            {DIGITS.map((d) => (
              <span
                key={d}
                className="font-display tabular-nums"
                style={{ height: digitHeight, lineHeight: `${digitHeight}px`, fontSize, color: textColor, fontWeight }}
              >
                {d}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
