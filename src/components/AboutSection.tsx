import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { events } from "../data/events";
import MapEmbed from "./MapEmbed";
import Counter from "./reactbits/Counter";
import TrueFocus from "./reactbits/TrueFocus";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { label: "Attendees", value: 5000, suffix: "+" },
  { label: "Events", value: events.length, suffix: "" },
  { label: "Biomes", value: 7, suffix: "" },
  { label: "Hours of Chaos", value: 72, suffix: "" },
];

const FAQS = [
  {
    q: "How do I register for an event?",
    a: "Open any event card, fill in your details, verify your email with the OTP sent to it, then complete the payment step. You'll get a ticket code the moment it's confirmed.",
  },
  {
    q: "Can I register for more than one event?",
    a: "Yes — there's no limit. Just repeat the registration flow from each event's card; your verified email will breeze through faster the second time.",
  },
  {
    q: "Is the payment on this site real?",
    a: "This build ships with a demo payment flow — the QR and transaction fields are for show, and no money actually moves. A production launch would swap in a real payment gateway before go-live.",
  },
  {
    q: "I didn't get my OTP — what now?",
    a: "Codes expire after 90 seconds and you can request a new one every 30 seconds via the Resend button. If email delivery is still in demo mode on this deployment, the code is shown directly in the UI instead.",
  },
  {
    q: "Where exactly is the venue?",
    a: "See the map below — pins are dropped on the exact campus grounds, with a one-tap directions link to get you there.",
  },
];

function StatCounter({ stat, isVisible }) {
  return (
    <div className="glass rounded-2xl px-6 py-8 text-center">
      <p className="flex items-center justify-center font-display text-4xl font-bold text-white sm:text-5xl">
        <Counter value={stat.value} isVisible={isVisible} fontSize={40} />
        <span className="text-cyan">{stat.suffix}</span>
      </p>
      <p className="mt-2 text-xs tracking-widest text-white/50 uppercase">{stat.label}</p>
    </div>
  );
}

function FaqItem({ item, open, onToggle }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.to(panelRef.current, {
      height: open ? "auto" : 0,
      opacity: open ? 1 : 0,
      duration: 0.4,
      ease: "power2.inOut",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        data-cursor-hover
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-display text-sm text-white">{item.q}</span>
        <span
          className="shrink-0 text-cyan transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div ref={panelRef} className="h-0 overflow-hidden opacity-0">
        <p className="px-5 pb-4 text-sm text-white/60">{item.a}</p>
      </div>
    </div>
  );
}

export default function AboutSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

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

      gsap.fromTo(
        statsRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 85%",
            onEnter: () => setStatsVisible(true),
          },
        }
      );

      gsap.fromTo(
        timelineRef.current.querySelectorAll(".timeline-item"),
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: timelineRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative px-6 py-32 md:px-12">
      <div ref={headingRef} className="mx-auto mb-16 max-w-3xl text-center">
        <p className="mb-3 font-display text-xs tracking-[0.4em] text-cyan text-glow-cyan uppercase">
          The Full Story
        </p>
        <h2 className="font-display text-4xl font-bold text-white uppercase md:text-5xl">
          About Gateways
        </h2>
        <div className="mt-5 flex justify-center">
          <TrueFocus sentence="Build Create Compete Celebrate" borderColor="#38f2ff" glowColor="rgba(56,242,255,0.6)" />
        </div>
        <p className="mt-6 text-white/60">
          Gateways is a season-long portal into blocky biomes stacked with hackathons, arenas, stages,
          and summits — run by students, for students, across three days of Aug 14–22, 2026.
        </p>
      </div>

      <div ref={statsRef} className="mx-auto mb-20 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((stat) => (
          <StatCounter key={stat.label} stat={stat} isVisible={statsVisible} />
        ))}
      </div>

      <div className="mx-auto mb-20 max-w-3xl">
        <h3 className="mb-8 text-center font-display text-2xl font-bold text-white uppercase">
          Schedule
        </h3>
        <div ref={timelineRef} className="relative flex flex-col gap-6 pl-8">
          <div className="absolute top-1 bottom-1 left-[7px] w-px bg-gradient-to-b from-cyan via-purple to-transparent" />
          {events.map((event) => (
            <div key={event.id} className="timeline-item relative">
              <span
                className="absolute top-1.5 -left-8 h-3.5 w-3.5 rounded-full border-2 border-void"
                style={{ background: event.glow, boxShadow: `0 0 10px ${event.glow}` }}
              />
              <p
                className="font-display text-[11px] tracking-widest uppercase"
                style={{ color: event.glow }}
              >
                {event.date} · {event.time}
              </p>
              <p className="font-display text-lg text-white">{event.title}</p>
              <p className="text-sm text-white/50">{event.tagline}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mb-20 max-w-3xl">
        <h3 className="mb-8 text-center font-display text-2xl font-bold text-white uppercase">
          Find the Venue
        </h3>
        <MapEmbed />
      </div>

      <div className="mx-auto max-w-3xl">
        <h3 className="mb-8 text-center font-display text-2xl font-bold text-white uppercase">
          FAQ
        </h3>
        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <FaqItem key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
