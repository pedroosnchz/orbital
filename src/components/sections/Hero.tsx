"use client";

import { useEffect, useMemo, useRef } from "react";
import { voyage } from "@/lib/voyage";
import { scrollToTarget } from "../VoyageEngine";

const WORD = "ABANDONA";
const SERIF = "la gravedad";

// pseudo-aleatorio determinista para que SSR y cliente coincidan
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function Hero() {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const serifRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  const drift = useMemo(
    () =>
      WORD.split("").map((_, i) => ({
        y: 0.6 + rand(i, 1) * 1.6,
        x: (rand(i, 2) - 0.5) * 0.8,
        r: (rand(i, 3) - 0.5) * 90,
        z: rand(i, 4),
      })),
    [],
  );

  useEffect(() => {
    let raf = 0;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const loop = (now: number) => {
      const hp = Math.min(window.scrollY / window.innerHeight, 1.5);
      const t = now / 1000;
      // sin ratón (táctil): una "onda de peso" recorre el titular sola
      const first = lettersRef.current[0]?.getBoundingClientRect();
      const last = lettersRef.current[WORD.length - 1]?.getBoundingClientRect();
      const tx = fine
        ? voyage.px
        : first && last
          ? first.left + ((Math.sin(t * 0.9) + 1) / 2) * (last.right - first.left)
          : 0;
      const ty = fine ? voyage.py : first ? first.top + first.height / 2 : 0;
      lettersRef.current.forEach((el, i) => {
        if (!el) return;
        const d = drift[i];
        // peso variable según la proximidad del cursor
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(tx - cx, ty - cy);
        const f = Math.exp(-(dist * dist) / (2 * 180 * 180));
        const w = 200 + 700 * f;
        el.style.fontVariationSettings = `"wght" ${w.toFixed(0)}`;
        // ingravidez: flotan a distintos ritmos
        const bob = Math.sin(t * 0.8 + i) * 4 * (1 - hp);
        const y = -hp * d.y * window.innerHeight * 0.5 + bob;
        const x = hp * d.x * window.innerWidth * 0.3;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${hp * d.r}deg) scale(${1 - hp * d.z * 0.4})`;
        el.style.opacity = String(1 - hp * (0.4 + d.z * 0.6));
        el.style.filter = `blur(${hp * d.z * 10}px)`;
      });
      if (serifRef.current) {
        serifRef.current.style.transform = `translate3d(${hp * -80}px, ${hp * 120}px, 0)`;
        serifRef.current.style.opacity = String(1 - hp * 1.2);
      }
      if (metaRef.current) metaRef.current.style.opacity = String(1 - hp * 2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [drift]);

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pt-28 md:px-12 lg:pl-64">
      <div ref={metaRef} className="mb-6 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">
        <span className="h-px w-10 bg-[var(--signal)]" />
        Vuelo 001 · Ventana de lanzamiento abierta
      </div>

      <h1 className="relative select-none leading-[0.8]" aria-label="Abandona la gravedad">
        <span aria-hidden className="block whitespace-nowrap font-display text-[12.5vw] tracking-[-0.04em] lg:text-[11vw]">
          {WORD.split("").map((ch, i) => (
            <span
              key={i}
              ref={(el) => {
                lettersRef.current[i] = el;
              }}
              className="inline-block will-change-transform"
              style={{ fontVariationSettings: '"wght" 200' }}
            >
              {ch}
            </span>
          ))}
        </span>
        <span
          ref={serifRef}
          aria-hidden
          className="-mt-[2vw] block text-right font-serif text-[13vw] italic leading-[0.9] tracking-[-0.02em] text-white/90 will-change-transform lg:text-[11.5vw]"
        >
          {SERIF}
          <span className="text-[var(--signal)]">.</span>
        </span>
      </h1>

      <div className="mt-12 grid max-w-6xl gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <p className="max-w-md text-balance text-[15px] leading-relaxed text-white/60">
          ORBITAL es la primera línea regular entre la superficie terrestre y el espacio profundo.
          Este documento es el vuelo: <span className="text-white">cada píxel que bajes, subes un kilómetro.</span>
        </p>
        <button
          onClick={() => scrollToTarget("#manifiesto")}
          data-cursor="Despegar"
          className="group relative flex h-36 w-36 items-center justify-center rounded-full border border-white/20 font-mono text-[10px] uppercase tracking-[0.3em] text-white transition-colors duration-500 hover:border-[var(--signal)] hover:text-black"
        >
          <span className="absolute inset-0 scale-0 rounded-full bg-[var(--signal)] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-100" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_18s_linear_infinite]">
            <defs>
              <path id="circ" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
            </defs>
            <text className="fill-current text-[7.2px] tracking-[0.42em]">
              <textPath href="#circ">INICIAR ASCENSO · INICIAR ASCENSO ·</textPath>
            </text>
          </svg>
          <span className="relative text-lg transition-transform duration-500 group-hover:-translate-y-1">↑</span>
        </button>
      </div>
    </section>
  );
}
