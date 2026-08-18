import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import BiomeDiorama from "./BiomeDiorama";
import NeonButton from "./NeonButton";
import RegistrationWizard from "./RegistrationWizard";

function burstConfetti(container, color) {
  if (!container) return;
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("span");
    p.style.position = "absolute";
    p.style.left = "50%";
    p.style.top = "38%";
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.borderRadius = Math.random() > 0.5 ? "9999px" : "2px";
    p.style.background = Math.random() > 0.5 ? color : "#ffffff";
    p.style.boxShadow = `0 0 8px ${color}`;
    p.style.pointerEvents = "none";
    p.style.zIndex = "30";
    container.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    gsap.to(p, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 40,
      rotate: Math.random() * 360,
      opacity: 0,
      duration: 1 + Math.random() * 0.6,
      ease: "power2.out",
      onComplete: () => p.remove(),
    });
  }
}

export default function EventModal({ event, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const [view, setView] = useState("details");
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    tl.fromTo(
      panelRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" },
      "-=0.2"
    );

    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
    if (view === "success") burstConfetti(panelRef.current, event.glow);
  }, [view, event.glow]);

  const close = () => {
    gsap.to(panelRef.current, { opacity: 0, y: 20, scale: 0.96, duration: 0.3, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 0.05, onComplete: onClose });
  };

  if (!event) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="glass relative grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-2"
        style={{ boxShadow: `0 30px 80px -20px ${event.glow}55` }}
      >
        <button
          onClick={close}
          data-cursor-hover
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
        >
          ✕
        </button>

        <div className="relative h-64 md:h-full">
          <BiomeDiorama biome={event.biome} color={event.glow} hovered />
        </div>

        <div ref={contentRef} className="flex max-h-[85vh] flex-col justify-center overflow-y-auto p-8">
          {view === "details" && (
            <>
              <span
                className="mb-3 w-fit rounded-full px-3 py-1 font-display text-[10px] tracking-widest uppercase"
                style={{ color: event.glow, border: `1px solid ${event.glow}66`, background: `${event.glow}1a` }}
              >
                {event.date} · {event.time}
              </span>
              <h3 className="font-display text-3xl font-bold text-white">{event.title}</h3>
              <p className="mt-1 text-sm tracking-wide text-white/50 uppercase">{event.tagline}</p>
              <p className="mt-4 text-white/70">{event.description}</p>
              <div className="mt-6">
                <NeonButton variant="primary" onClick={() => setView("register")}>
                  Register
                </NeonButton>
              </div>
            </>
          )}

          {view === "register" && (
            <>
              <button
                onClick={() => setView("details")}
                data-cursor-hover
                className="mb-4 flex w-fit items-center gap-1 text-xs tracking-widest text-white/50 uppercase hover:text-white"
              >
                ← Back to {event.title}
              </button>
              <h3 className="mb-4 font-display text-2xl font-bold text-white">Claim Your Spot</h3>
              <RegistrationWizard event={event} onSuccess={(data) => { setTicket(data); setView("success"); }} />
            </>
          )}

          {view === "success" && ticket && (
            <div className="text-center md:text-left">
              <span
                className="mb-4 inline-block w-fit rounded-full px-3 py-1 font-display text-[10px] tracking-widest uppercase"
                style={{ color: event.glow, border: `1px solid ${event.glow}66`, background: `${event.glow}1a` }}
              >
                Portal Unlocked
              </span>
              <h3 className="font-display text-2xl font-bold text-white">You're in, {ticket.name.split(" ")[0]}!</h3>
              <p className="mt-2 text-white/60">
                A confirmation for <span className="text-white">{event.title}</span> is on its way to{" "}
                <span className="text-white">{ticket.email}</span>.
              </p>

              <div
                className="mt-5 rounded-2xl border border-dashed p-4 font-display"
                style={{ borderColor: `${event.glow}66`, background: `${event.glow}12` }}
              >
                <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Ticket Code</p>
                <p className="text-xl tracking-widest text-white" style={{ color: event.glow }}>
                  {ticket.ticket}
                </p>
              </div>

              <p className="mt-3 text-xs text-white/40">
                Payment ref <span className="text-white/70">{ticket.txnId}</span> · {ticket.college} · {ticket.course}
              </p>

              <div className="mt-6">
                <NeonButton variant="ghost" onClick={close}>
                  Done
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
