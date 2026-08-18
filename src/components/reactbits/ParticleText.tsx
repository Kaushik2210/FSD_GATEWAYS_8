import { useEffect, useRef } from "react";

// React-Bits-style "Particle Text" — samples a glyph raster onto a canvas
// and animates particles scattering in, then gathering into the text on
// mount, with cursor repel. Pure canvas 2D, no extra dependency.
//
// Auto-fits the font size to the available width of its parent, then
// shrink-wraps the canvas to the actual rendered text box (rather than
// stretching to fill 100% of the column) — otherwise long text at a large
// requested size gets clipped mid-sample and reads as noise instead of
// legible letters.
export default function ParticleText({
  text = "React Bits",
  particleSize = 1.3,
  density = 3.4,
  scatter = 190,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 42,
  repelRadius = 120,
  idleDrift = 0.8,
  color = "#ffffff",
  highlightColor = "#8b5cf6",
  glow = true,
  maxFontSize = "clamp(2.4rem, 9vw, 5.5rem)",
  minFontSize = 22,
  fontWeight = 800,
  fontFamily = "inherit",
  align = "center",
  className = "",
  style,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let raf = 0;
    let startTime = 0;
    let boxW = 0;
    let boxH = 0;
    const pointer = { x: -9999, y: -9999 };

    function resolvedMaxFontPx() {
      const probe = document.createElement("div");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.fontSize = typeof maxFontSize === "number" ? `${maxFontSize}px` : maxFontSize;
      document.body.appendChild(probe);
      const px = parseFloat(getComputedStyle(probe).fontSize);
      probe.remove();
      return px;
    }

    function buildParticles() {
      const parent = container.parentElement;
      const availableWidth = (parent ? parent.clientWidth : window.innerWidth) || 320;
      const fam = fontFamily === "inherit" ? getComputedStyle(container).fontFamily || "sans-serif" : fontFamily;

      const measureCtx = document.createElement("canvas").getContext("2d");
      let px = resolvedMaxFontPx();
      measureCtx.font = `${fontWeight} ${px}px ${fam}`;
      let textWidth = measureCtx.measureText(text).width;
      const budget = availableWidth * 0.94;
      if (textWidth > budget) {
        px = Math.max(minFontSize, px * (budget / textWidth));
        measureCtx.font = `${fontWeight} ${px}px ${fam}`;
        textWidth = measureCtx.measureText(text).width;
      }

      boxW = Math.ceil(textWidth + px * 0.3);
      boxH = Math.ceil(px * 1.3);

      canvas.width = boxW * dpr;
      canvas.height = boxH * dpr;
      canvas.style.width = `${boxW}px`;
      canvas.style.height = `${boxH}px`;
      container.style.width = `${boxW}px`;
      container.style.height = `${boxH}px`;

      const off = document.createElement("canvas");
      off.width = boxW * dpr;
      off.height = boxH * dpr;
      const octx = off.getContext("2d");
      octx.scale(dpr, dpr);
      octx.font = `${fontWeight} ${px}px ${fam}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.fillText(text, boxW / 2, boxH / 2);

      const img = octx.getImageData(0, 0, off.width, off.height).data;
      const pts = [];
      const step = Math.max(1, density) * dpr;
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const alpha = img[(y * off.width + x) * 4 + 3];
          if (alpha > 128) {
            const tx = x / dpr;
            const ty = y / dpr;
            const angle = Math.random() * Math.PI * 2;
            const dist = scatter * (0.5 + Math.random() * 0.5);
            pts.push({
              tx,
              ty,
              sx: tx + Math.cos(angle) * dist,
              sy: ty + Math.sin(angle) * dist,
              delay: Math.random() * stagger,
              driftPhase: Math.random() * Math.PI * 2,
              mix: Math.random(),
            });
          }
        }
      }
      particles = pts;
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function draw(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, boxW, boxH);

      for (const p of particles) {
        const localT = reduceMotion ? 1 : Math.min(1, Math.max(0, (elapsed - p.delay) / gatherDuration));
        const eased = easeOutCubic(localT);
        let x = p.sx + (p.tx - p.sx) * eased;
        let y = p.sy + (p.ty - p.sy) * eased;

        if (localT >= 1) {
          x += Math.sin(now * 0.0016 + p.driftPhase) * idleDrift;
          y += Math.cos(now * 0.0013 + p.driftPhase) * idleDrift;
        }

        const dist = Math.hypot(pointer.x - x, pointer.y - y);
        if (dist < repelRadius) {
          const force = (1 - dist / repelRadius) * pointerRepel;
          const angle = Math.atan2(y - pointer.y, x - pointer.x);
          x += Math.cos(angle) * force;
          y += Math.sin(angle) * force;
        }

        ctx.beginPath();
        ctx.fillStyle = p.mix > 0.75 ? highlightColor : color;
        if (glow && p.mix > 0.75) {
          ctx.shadowColor = highlightColor;
          ctx.shadowBlur = 2.5;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    buildParticles();
    raf = requestAnimationFrame(draw);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onResize = () => {
      startTime = 0;
      buildParticles();
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div
      className={`flex ${align === "left" ? "justify-center md:justify-start" : "justify-center"} ${className}`}
      style={style}
    >
      <div ref={containerRef} className="relative" aria-label={text} role="img">
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
