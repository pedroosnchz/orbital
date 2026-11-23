"use client";

import { useEffect, useRef } from "react";
import { voyage } from "@/lib/voyage";

/**
 * Retícula de navegación: punto preciso + anillo con inercia + líneas de mira.
 * Los elementos con data-cursor="Etiqueta" expanden la retícula y muestran texto.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const h = useRef<HTMLDivElement>(null);
  const v = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    let rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    let scale = 1, targetScale = 1;
    let raf = 0;

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, select, label");
      const text = el?.dataset.cursor ?? (el ? "" : null);
      targetScale = el ? 2.4 : 1;
      if (label.current) {
        label.current.textContent = text ?? "";
        label.current.style.opacity = text ? "1" : "0";
      }
      ring.current?.classList.toggle("is-active", !!el);
    };
    const onDown = () => (targetScale *= 0.7);
    const onUp = () => (targetScale /= 0.7);

    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const loop = () => {
      const { px, py } = voyage;
      rx += (px - rx) * 0.16;
      ry += (py - ry) * 0.16;
      scale += (targetScale - scale) * 0.15;
      if (dot.current) dot.current.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`;
      if (label.current) label.current.style.transform = `translate3d(${rx + 28}px, ${ry - 6}px, 0)`;
      if (h.current) h.current.style.transform = `translate3d(0, ${ry}px, 0)`;
      if (v.current) v.current.style.transform = `translate3d(${rx}px, 0, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="cursor-layer pointer-events-none fixed inset-0 z-[100] hidden mix-blend-difference">
      <div ref={h} className="absolute left-0 top-0 h-px w-full bg-white/[0.07]" />
      <div ref={v} className="absolute left-0 top-0 h-full w-px bg-white/[0.07]" />
      <div ref={ring} className="cursor-ring absolute -left-4 -top-4 h-8 w-8 will-change-transform">
        <svg viewBox="0 0 32 32" className="h-full w-full text-white">
          <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
          <path d="M16 0v5M16 27v5M0 16h5M27 16h5" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>
      <div ref={dot} className="absolute -left-[2px] -top-[2px] h-1 w-1 rounded-full bg-white" />
      <span
        ref={label}
        className="absolute left-0 top-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] text-white opacity-0 transition-opacity"
      />
    </div>
  );
}
