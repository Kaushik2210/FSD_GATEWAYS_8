import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Events", href: "#events" },
  { label: "Memories", href: "#memories" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const navRef = useRef(null);
  const listRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 120);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      y: hidden ? -100 : 0,
      opacity: hidden ? 0 : 1,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [hidden]);

  useEffect(() => {
    if (!listRef.current) return;
    gsap.fromTo(
      listRef.current.children,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 3.2 }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-fit -translate-x-1/2 sm:top-6"
      data-cursor-hover
    >
      <ul
        ref={listRef}
        className="glass flex items-center justify-center gap-0.5 overflow-x-auto rounded-full px-1.5 py-1.5 shadow-[0_0_30px_rgba(168,85,255,0.15)] sm:gap-1 sm:px-2 sm:py-2"
      >
        {LINKS.map((link) => (
          <li key={link.label} className="shrink-0">
            <a
              href={link.href}
              className="group relative block rounded-full px-2.5 py-2 font-display text-[10px] tracking-widest text-white/70 uppercase transition-colors duration-300 hover:text-white sm:px-4 sm:text-xs"
            >
              <span className="relative z-10">{link.label}</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan/20 to-purple/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
