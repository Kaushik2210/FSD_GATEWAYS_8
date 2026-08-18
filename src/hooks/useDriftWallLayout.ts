import { useEffect, useState } from "react";

// DriftWall lays out fixed-pixel-width columns side by side. The desktop
// values (5 columns x 190px) add up to ~1000px, which just gets clipped by
// the wall's overflow-hidden container on a phone — only a sliver of the
// gallery was ever visible below ~640px. Pick a column count/tile size that
// actually fits the viewport instead.
const BREAKPOINTS = [
  { minWidth: 1024, columns: 5, tileWidth: 190, tileHeight: 130, gap: 16 },
  { minWidth: 640, columns: 4, tileWidth: 150, tileHeight: 128, gap: 14 },
  { minWidth: 0, columns: 3, tileWidth: 98, tileHeight: 120, gap: 10 },
];

function pickLayout(width) {
  return BREAKPOINTS.find((bp) => width >= bp.minWidth) || BREAKPOINTS[BREAKPOINTS.length - 1];
}

export function useDriftWallLayout() {
  const [layout, setLayout] = useState(BREAKPOINTS[BREAKPOINTS.length - 1]);

  useEffect(() => {
    const onResize = () => setLayout(pickLayout(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return layout;
}
