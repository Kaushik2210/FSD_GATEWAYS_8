import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLiveWeather } from "../hooks/useLiveWeather";

const KIND_GLOW = {
  clear: "#ffd76b",
  cloud: "#9aa0b4",
  fog: "#9aa0b4",
  rain: "#38f2ff",
  snow: "#e8f4ff",
  storm: "#a855ff",
};

export default function WeatherHud() {
  const { weather, status } = useLiveWeather();
  const ref = useRef(null);

  useEffect(() => {
    if (status === "ready" && ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)" }
      );
    }
  }, [status]);

  if (status !== "ready" || !weather) return null;

  const glow = KIND_GLOW[weather.kind] || "#38f2ff";

  return (
    <div
      ref={ref}
      className="glass fixed bottom-5 left-5 z-40 flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 opacity-0"
      style={{ boxShadow: `0 0 24px ${glow}33` }}
      data-cursor-hover
      title={`Live weather for ${weather.city}`}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {weather.icon}
      </span>
      <div className="leading-tight">
        <p className="font-display text-[11px] tracking-widest text-white uppercase" style={{ color: glow }}>
          {weather.tempC}°C · {weather.label}
        </p>
        <p className="text-[10px] text-white/40">Live sky over {weather.city}</p>
      </div>
    </div>
  );
}
