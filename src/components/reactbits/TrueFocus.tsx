import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// React-Bits-style "True Focus" — cycles a glowing focus frame across the
// words of a sentence, blurring the rest. Hand-rolled with GSAP instead of
// the original's `motion` dependency.
export default function TrueFocus({
  sentence = "True Focus",
  separator = " ",
  blurAmount = 5,
  borderColor = "#38f2ff",
  glowColor = "rgba(56,242,255,0.6)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = "",
}) {
  const words = sentence.split(separator);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const frameRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      (animationDuration + pauseBetweenAnimations) * 1000
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length]);

  useEffect(() => {
    const container = containerRef.current;
    const word = wordRefs.current[index];
    const frame = frameRef.current;
    if (!container || !word || !frame) return;

    const cRect = container.getBoundingClientRect();
    const wRect = word.getBoundingClientRect();
    const pad = 6;
    gsap.to(frame, {
      x: wRect.left - cRect.left - pad,
      y: wRect.top - cRect.top - pad,
      width: wRect.width + pad * 2,
      height: wRect.height + pad * 2,
      duration: animationDuration,
      ease: "power3.out",
    });

    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        filter: i === index ? "blur(0px)" : `blur(${blurAmount}px)`,
        opacity: i === index ? 1 : 0.45,
        duration: animationDuration,
        ease: "power2.out",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div ref={containerRef} className={`relative inline-flex flex-wrap justify-center gap-x-3 gap-y-2 ${className}`}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          className="font-display text-sm tracking-widest text-white uppercase"
        >
          {w}
        </span>
      ))}
      <span
        ref={frameRef}
        className="pointer-events-none absolute top-0 left-0 rounded-md"
        style={{
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 16px ${glowColor}`,
          width: 0,
          height: 0,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
