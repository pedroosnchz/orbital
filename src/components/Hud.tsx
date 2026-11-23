"use client";

import { useEffect, useRef } from "react";
import { distanceAt, formatKm, voyage, zoneAt, ZONES } from "@/lib/voyage";
import { scrollToTarget } from "./VoyageEngine";

const NAV = [
  { href: "#manifiesto", label: "Manifiesto", code: "01" },
  { href: "#ruta", label: "Ruta", code: "02" },
  { href: "#nave", label: "Nave", code: "03" },
  { href: "#clases", label: "Clases", code: "04" },
  { href: "#embarque", label: "Embarque", code: "05" },
];

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, "0");

export default function Hud() {
  const clock = useRef<HTMLSpanElement>(null);
  const dist = useRef<HTMLSpanElement>(null);
  const zone = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const vel = useRef<HTMLSpanElement>(null);
  const velBar = useRef<HTMLDivElement>(null);
  const coords = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastZone = "";
    const loop = (now: number) => {
      const t = (now - voyage.t0) / 1000;
      const p = voyage.progress;
      if (clock.current)
        clock.current.textContent = `T+ ${pad(t / 3600)}:${pad((t / 60) % 60)}:${pad(t % 60)}.${pad((t * 100) % 100)}`;
      if (dist.current) dist.current.textContent = formatKm(distanceAt(p));
      const z = zoneAt(p).label;
      if (zone.current && z !== lastZone) {
        lastZone = z;
        zone.current.textContent = z;
        zone.current.animate(
          [{ opacity: 0, filter: "blur(6px)", letterSpacing: "0.6em" }, { opacity: 1, filter: "blur(0)", letterSpacing: "0.3em" }],
          { duration: 600, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
      }
      if (marker.current) marker.current.style.transform = `translateY(${p * 100}%)`;
      const v = Math.abs(voyage.velocity);
      if (vel.current) vel.current.textContent = (7.8 + v * 41.3).toFixed(1).padStart(6, "0");
      if (velBar.current) velBar.current.style.transform = `scaleX(${Math.min(v / 60, 1)})`;
      if (pct.current) pct.current.textContent = pad(p * 100, 3);
      if (coords.current) {
        const ra = ((voyage.mx + 1) * 12).toFixed(2);
        const dec = (-voyage.my * 90).toFixed(2);
        coords.current.textContent = `AR ${ra}h · DEC ${Number(dec) >= 0 ? "+" : ""}${dec}°`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="hud pointer-events-none fixed inset-0 z-40 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
      {/* Marco de visor */}
      <span className="absolute left-4 top-4 h-5 w-5 border-l border-t border-white/30" />
      <span className="absolute right-4 top-4 h-5 w-5 border-r border-t border-white/30" />
      <span className="absolute bottom-4 left-4 h-5 w-5 border-b border-l border-white/30" />
      <span className="absolute bottom-4 right-4 h-5 w-5 border-b border-r border-white/30" />

      {/* Barra superior */}
      <header className="pointer-events-auto absolute inset-x-8 top-7 flex items-center justify-between gap-6">
        <button
          onClick={() => scrollToTarget(0)}
          className="group flex items-center gap-3 text-white"
          aria-label="Volver al inicio"
        >
          <svg viewBox="0 0 32 32" className="h-6 w-6 transition-transform duration-700 group-hover:rotate-180">
            <circle cx="16" cy="16" r="5" fill="currentColor" />
            <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-25 16 16)" />
          </svg>
          <span className="font-display text-[13px] font-semibold tracking-[0.35em]">ORBITAL</span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur-md md:flex">
          {NAV.map((n) => (
            <button
              key={n.href}
              onClick={() => scrollToTarget(n.href)}
              className="group relative overflow-hidden rounded-full px-4 py-2 text-white/60 transition-colors hover:text-black"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-y-0" />
              <span className="relative">
                <span className="mr-1.5 opacity-40">{n.code}</span>
                {n.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--signal)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
          </span>
          <span ref={clock} className="tabular-nums text-white">T+ 00:00:00.00</span>
        </div>
      </header>

      {/* Altímetro */}
      <aside className="absolute bottom-28 left-8 top-28 hidden w-48 lg:block">
        <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-white/0 via-white/25 to-white/0" />
        {ZONES.map((z) => (
          <div key={z.label} className="absolute left-0 flex items-center gap-2" style={{ top: `${z.at * 100}%` }}>
            <span className="h-px w-2 bg-white/40" />
            <span className="text-[8px] tracking-[0.25em] text-white/25">{z.label}</span>
          </div>
        ))}
        <div ref={marker} className="absolute inset-x-0 top-0 h-full will-change-transform">
          <div className="absolute -left-[3px] top-0 flex -translate-y-1/2 items-center gap-3">
            <span className="h-[7px] w-[7px] rotate-45 border border-[var(--signal)] bg-black" />
            <div className="flex flex-col gap-1 rounded-sm bg-black/40 px-2 py-1.5 backdrop-blur-sm">
              <span ref={dist} className="text-[11px] tabular-nums tracking-[0.12em] text-white">0.0 km</span>
              <span ref={zone} className="text-[8px] tracking-[0.3em] text-[var(--signal)]">SUPERFICIE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Inferior */}
      <footer className="absolute inset-x-8 bottom-7 flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-white/40">VEL</span>
            <span ref={vel} className="text-white tabular-nums">0007.8</span>
            <span className="text-white/40">km/s</span>
          </div>
          <div className="h-px w-40 bg-white/10">
            <div ref={velBar} className="h-px w-full origin-left bg-[var(--signal)]" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
        <span ref={coords} className="hidden tabular-nums sm:block">AR 12.00h · DEC +0.00°</span>
        <div className="flex items-baseline gap-1 text-white">
          <span ref={pct} className="font-display text-3xl font-light tabular-nums tracking-tight">000</span>
          <span className="text-white/40">
            %<span className="hidden sm:inline"> trayecto</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
