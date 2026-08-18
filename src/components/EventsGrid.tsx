import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEvents } from "../hooks/useEvents";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import TextPressure from "./reactbits/TextPressure";

gsap.registerPlugin(ScrollTrigger);

export default function EventsGrid() {
  const gridRef = useRef(null);
  const headingRef = useRef(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const events = useEvents();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        }
      );

      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0, rotateX: -10 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="events" className="relative px-6 py-32 md:px-12">
      <div ref={headingRef} className="mx-auto mb-16 max-w-3xl text-center">
        <p className="mb-3 font-display text-xs tracking-[0.4em] text-purple text-glow-purple uppercase">
          Choose Your World
        </p>
        <div className="flex justify-center px-2">
          <TextPressure text="EVENTS ACROSS EVERY BIOME" fontSize="clamp(1.6rem, 5.2vw, 3rem)" glowColor="#a855ff" />
        </div>
        <p className="mt-4 text-white/60">
          Each block below is a living portal — click one to step inside.
        </p>
      </div>

      <div ref={gridRef} className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onOpen={setActiveEvent} />
        ))}
      </div>

      {activeEvent && <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />}
    </section>
  );
}
