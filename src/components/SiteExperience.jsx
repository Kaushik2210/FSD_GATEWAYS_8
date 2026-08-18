"use client";

import { useState } from "react";
import IntroPortal from "./IntroPortal";
import CursorOrb from "./CursorOrb";
import AmbientBackground from "./AmbientBackground";
import ScrollDragon from "./ScrollDragon";
import Navbar from "./Navbar";
import WeatherHud from "./WeatherHud";
import Hero from "./Hero";
import EventsGrid from "./EventsGrid";
import MemoriesGallery from "./MemoriesGallery";
import AboutSection from "./AboutSection";
import Footer from "./Footer";
import { useSmoothScroll } from "../hooks/useSmoothScroll";

export default function SiteExperience() {
  const [introDone, setIntroDone] = useState(false);
  useSmoothScroll(introDone);

  return (
    <>
      {!introDone && <IntroPortal onComplete={() => setIntroDone(true)} />}
      <AmbientBackground />
      <CursorOrb />
      <div className="noise-overlay" />
      <div className="scanline-overlay" />
      <div className="grid-overlay" />
      {introDone && <ScrollDragon />}
      <Navbar />
      <WeatherHud />
      <main
        className="relative z-10"
        style={{ opacity: introDone ? 1 : 0, transition: "opacity 0.8s ease" }}
      >
        <Hero />
        <EventsGrid />
        <MemoriesGallery />
        <AboutSection />
        <Footer />
      </main>
    </>
  );
}
