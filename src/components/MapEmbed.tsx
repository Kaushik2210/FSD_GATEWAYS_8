import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const VENUE = {
  name: "Christ University — Central Campus",
  lat: 12.9345,
  lng: 77.6058,
  address: "Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru, Karnataka 560029",
};

const directionsUrl = `https://www.openstreetmap.org/directions?to=${VENUE.lat}%2C${VENUE.lng}`;

const glowIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;width:16px;height:16px;border-radius:9999px;
    background:#38f2ff;box-shadow:0 0 10px #38f2ff,0 0 28px #38f2ff,0 0 2px #fff;
    border:2px solid rgba(255,255,255,0.8);
  "></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapEmbed() {
  const mountRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || mapRef.current) return;

    const map = L.map(mountRef.current, {
      center: [VENUE.lat, VENUE.lng],
      zoom: 15,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    L.marker([VENUE.lat, VENUE.lng], { icon: glowIcon }).addTo(map).bindPopup(VENUE.name);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="glass isolate overflow-hidden rounded-3xl">
      <div ref={mountRef} className="h-72 w-full" style={{ background: "#0a0a0c" }} />
      <div className="flex flex-col gap-1 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-sm text-white">{VENUE.name}</p>
          <p className="text-xs text-white/50">{VENUE.address}</p>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          data-cursor-hover
          className="mt-2 w-fit shrink-0 rounded-full border border-cyan/50 px-4 py-2 font-display text-[11px] tracking-widest text-cyan uppercase sm:mt-0"
        >
          Get Directions →
        </a>
      </div>
    </div>
  );
}
