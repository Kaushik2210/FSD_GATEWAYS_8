import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 90%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={ref} className="relative overflow-hidden px-6 py-24 text-center">
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() > 0.85 ? 2 : 1,
              height: Math.random() > 0.85 ? 2 : 1,
              opacity: 0.15 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite`,
            }}
          />
        ))}
      </div>

      <p className="font-display text-2xl font-bold tracking-widest text-white/80 uppercase">Gateways</p>
      <p className="mt-2 text-sm text-white/40">The portal closes here — see you across the biomes.</p>
      <p className="mt-8 text-xs text-white/25">
        © {new Date().getFullYear()} Gateways. Built for the campus that never stops exploring.
      </p>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </footer>
  );
}
