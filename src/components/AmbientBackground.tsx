import { useEffect, useRef } from "react";
import { createAmbientScene } from "../three/ambientScene";
import { useLiveWeather } from "../hooks/useLiveWeather";

// A persistent, full-page living backdrop — drifting voxel islands, rising
// soul particles, a recycling item-drop block, and a slow neon hue-cycle.
// Sits fixed behind every section so the site never goes flat past the hero.
// Rain/snow/storm and day-night mood are driven by a real, live weather API.
export default function AmbientBackground() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const { weather } = useLiveWeather();

  useEffect(() => {
    if (!mountRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = createAmbientScene(mountRef.current);
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!weather || !sceneRef.current) return;
    sceneRef.current.setWeather(weather.kind, weather.isDay);
  }, [weather]);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
