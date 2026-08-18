import { useRef } from "react";
import type { ReactNode, MouseEvent, ElementType } from "react";
import gsap from "gsap";

type NeonButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: (e: MouseEvent) => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function NeonButton({ children, variant = "primary", onClick, href, type = "button", disabled = false }: NeonButtonProps) {
  const ref = useRef<any>(null);
  const quickX = useRef<((v: number) => void) | null>(null);
  const quickY = useRef<((v: number) => void) | null>(null);

  const ensureQuick = () => {
    if (!ref.current) return;
    if (!quickX.current) {
      quickX.current = gsap.quickTo(ref.current, "x", { duration: 0.5, ease: "power3.out" });
      quickY.current = gsap.quickTo(ref.current, "y", { duration: 0.5, ease: "power3.out" });
    }
  };

  const onMouseMove = (e) => {
    ensureQuick();
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    quickX.current(relX * 0.35);
    quickY.current(relY * 0.35);
  };

  const onMouseLeave = () => {
    ensureQuick();
    quickX.current?.(0);
    quickY.current?.(0);
  };

  const ripple = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const circle = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 1.8;
    circle.style.position = "absolute";
    circle.style.left = `${e.clientX - rect.left}px`;
    circle.style.top = `${e.clientY - rect.top}px`;
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.marginLeft = `${-size / 2}px`;
    circle.style.marginTop = `${-size / 2}px`;
    circle.style.borderRadius = "9999px";
    circle.style.background =
      variant === "primary"
        ? "radial-gradient(circle, rgba(56,242,255,0.5), transparent 70%)"
        : "radial-gradient(circle, rgba(168,85,255,0.5), transparent 70%)";
    circle.style.pointerEvents = "none";
    el.appendChild(circle);
    gsap.fromTo(
      circle,
      { scale: 0, opacity: 0.9 },
      {
        scale: 1,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        onComplete: () => circle.remove(),
      }
    );
    gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  };

  const base =
    "relative overflow-hidden isolate inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-display text-sm tracking-widest uppercase";

  const style =
    variant === "primary"
      ? "bg-gradient-to-r from-cyan to-purple text-black shadow-[0_0_25px_rgba(56,242,255,0.45)] hover:shadow-[0_0_45px_rgba(168,85,255,0.65)] transition-shadow duration-300"
      : "glass text-white hover:shadow-[0_0_30px_rgba(168,85,255,0.35)] transition-shadow duration-300";

  const disabledStyle = disabled ? "cursor-not-allowed opacity-40 grayscale" : "";

  const Tag: ElementType = href && !disabled ? "a" : "button";

  return (
    <Tag
      href={disabled ? undefined : href}
      type={Tag === "button" ? type : undefined}
      disabled={Tag === "button" ? disabled : undefined}
      aria-disabled={disabled}
      ref={ref}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        ripple(e);
        onClick?.(e);
      }}
      onMouseMove={disabled ? undefined : onMouseMove}
      onMouseLeave={disabled ? undefined : onMouseLeave}
      className={`${base} ${style} ${disabledStyle}`}
      data-cursor-hover
    >
      {children}
    </Tag>
  );
}
