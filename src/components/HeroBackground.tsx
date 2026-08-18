import { useEffect, useRef } from "react";
import { createHeroScene } from "../three/heroScene";

export default function HeroBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const scene = createHeroScene(mountRef.current);
    return () => scene.dispose();
  }, []);

  return <div ref={mountRef} className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />;
}
