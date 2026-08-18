"use client";

import dynamic from "next/dynamic";

// The whole experience is Three.js / GSAP / Lenis driven and reads window,
// document, and localStorage well outside of effects (e.g. IntroPortal's
// WebGL mount) — there is nothing here for the server to usefully render, so
// it's loaded client-only rather than risking a hydration mismatch.
const SiteExperience = dynamic(() => import("./SiteExperience"), { ssr: false });

export default function SiteExperienceLoader() {
  return <SiteExperience />;
}
