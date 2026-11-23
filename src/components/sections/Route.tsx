"use client";

import { CSSProperties, useRef } from "react";
import { range, useScrollFrame } from "@/lib/hooks";
import Scramble from "../Scramble";

/**
 * Textura fractal (feTurbulence) coloreada con una rampa por canal.
 * La mitad derecha es el espejo de la izquierda: así el bucle de rotación no tiene costura.
 */
function tex(freq: string, seed: number, r: string, g: string, b: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='400'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='6' seed='${seed}'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='table' tableValues='${r}'/><feFuncG type='table' tableValues='${g}'/><feFuncB type='table' tableValues='${b}'/><feFuncA type='table' tableValues='1 1'/></feComponentTransfer></filter><rect width='800' height='400' filter='url(%23n)'/><g transform='translate(1600 0) scale(-1 1)'><rect width='800' height='400' filter='url(%23n)'/></g></svg>`;
  return `url("data:image/svg+xml;utf8,${svg.replace(/"/g, "'").replace(/#/g, "%23")}")`;
}

const TEX = {
  earth: tex("0.009 0.02", 8, "0.01 0.02 0.04 0.2 0.42 0.85", "0.05 0.1 0.17 0.3 0.36 0.85", "0.14 0.27 0.36 0.15 0.17 0.85"),
  moon: tex("0.02 0.03", 4, "0.06 0.2 0.4 0.58 0.78", "0.06 0.2 0.39 0.56 0.76", "0.07 0.21 0.4 0.57 0.76"),
  mars: tex("0.01 0.035", 11, "0.25 0.55 0.78 0.9 0.95", "0.06 0.18 0.32 0.45 0.7", "0.03 0.08 0.15 0.25 0.5"),
};

type Stop = {
  code: string;
  name: string;
  dist: string;
  line: string;
  stats: [string, string][];
  visual: "karman" | "earth" | "moon" | "mars" | "helio";
};

const STOPS: Stop[] = [
  {
    code: "WP-01",
    name: "Kármán",
    dist: "100 km",
    line: "Aquí termina el cielo y empieza todo lo demás.",
    stats: [["Gravedad", "0,97 g"], ["Temperatura", "−78 °C"], ["Llegada", "T+ 8 min"]],
    visual: "karman",
  },
  {
    code: "WP-02",
    name: "Órbita baja",
    dist: "408 km",
    line: "Dieciséis amaneceres al día. Ninguno se repite.",
    stats: [["Velocidad", "7,66 km/s"], ["Periodo", "92 min"], ["Llegada", "T+ 6 h"]],
    visual: "earth",
  },
  {
    code: "WP-03",
    name: "Luna",
    dist: "384 400 km",
    line: "Un silencio tan grande que se oye.",
    stats: [["Gravedad", "0,165 g"], ["Temperatura", "−173/127 °C"], ["Llegada", "T+ 3 d"]],
    visual: "moon",
  },
  {
    code: "WP-04",
    name: "Marte",
    dist: "225 M km",
    line: "Polvo de óxido y atardeceres azules.",
    stats: [["Gravedad", "0,38 g"], ["Día", "24 h 37 min"], ["Llegada", "T+ 212 d"]],
    visual: "mars",
  },
  {
    code: "WP-05",
    name: "Heliopausa",
    dist: "18 000 M km",
    line: "Donde el viento del Sol deja de soplar.",
    stats: [["Señal a la Tierra", "16 h 40 min"], ["Sol", "Una estrella más"], ["Llegada", "T+ 41 años"]],
    visual: "helio",
  },
];

function Visual({ kind }: { kind: Stop["visual"] }) {
  if (kind === "karman")
    return (
      <div className="relative aspect-square w-full">
        <div className="absolute inset-x-[-40%] top-[45%] aspect-square rounded-full bg-[radial-gradient(circle_at_50%_0%,#0b1a3a,#010208_55%)] shadow-[0_-8px_40px_rgba(80,150,255,.55),0_-2px_6px_rgba(160,210,255,.9)]" />
        <div className="absolute inset-x-[-40%] top-[43%] aspect-square rounded-full border-t border-sky-300/40 blur-[2px]" />
        <div className="absolute left-1/2 top-[30%] h-[14%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--signal)] to-transparent" />
        <span className="absolute left-1/2 top-[24%] -translate-x-1/2 font-mono text-[9px] tracking-[0.3em] text-[var(--signal)]">
          100 KM
        </span>
      </div>
    );
  if (kind === "helio")
    return (
      <div className="relative aspect-square w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute inset-0 m-auto rounded-full border border-white/10"
            style={{
              width: `${30 + i * 17}%`,
              height: `${30 + i * 17}%`,
              borderColor: i === 3 ? "rgba(255,106,43,.6)" : undefined,
              boxShadow: i === 3 ? "0 0 60px rgba(255,106,43,.25), inset 0 0 60px rgba(255,106,43,.15)" : undefined,
              animation: `spin ${60 + i * 25}s linear infinite ${i % 2 ? "reverse" : ""}`,
              borderStyle: i % 2 ? "dashed" : "solid",
            }}
          />
        ))}
        <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white shadow-[0_0_30px_8px_rgba(255,200,120,.6)]" />
      </div>
    );
  const style = {
    "--tex": TEX[kind],
    "--spin": kind === "earth" ? "50s" : kind === "moon" ? "120s" : "80s",
  } as CSSProperties;
  return (
    <div className="relative aspect-square w-full">
      {kind === "earth" && (
        <div className="absolute inset-[-12%] rounded-full border border-white/10 [transform:rotateX(72deg)_rotateZ(-20deg)]">
          <div className="absolute inset-0 animate-[spin_6s_linear_infinite]">
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--signal)] shadow-[0_0_12px_var(--signal)]" />
          </div>
        </div>
      )}
      <div
        className={`planet h-full w-full ${
          kind === "earth"
            ? "shadow-[0_0_60px_rgba(80,160,255,.35)]"
            : kind === "mars"
              ? "shadow-[0_0_80px_rgba(255,106,43,.25)]"
              : "shadow-[0_0_60px_rgba(255,255,255,.08)]"
        }`}
        style={style}
      />
    </div>
  );
}

export default function Route() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const visuals = useRef<(HTMLDivElement | null)[]>([]);

  useScrollFrame(section, (p) => {
    const t = track.current;
    if (!t) return;
    const lp = range(p, 0.02, 0.98);
    const max = t.scrollWidth - window.innerWidth;
    t.style.transform = `translate3d(${-lp * max}px,0,0)`;
    if (bar.current) bar.current.style.transform = `scaleX(${lp})`;
    // parallax interno de cada planeta
    visuals.current.forEach((v) => {
      if (!v) return;
      const r = v.getBoundingClientRect();
      const off = (r.left + r.width / 2 - window.innerWidth / 2) / window.innerWidth;
      v.style.transform = `translate3d(${off * -120}px, ${Math.abs(off) * 40}px, 0) rotate(${off * 12}deg)`;
    });
  });

  return (
    <section id="ruta" ref={section} className="relative h-[520vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-28 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 md:px-12 lg:pl-64">
          <span>
            <span className="text-[var(--signal)]">02</span> — <Scramble text="Plan de vuelo" />
          </span>
          <div className="hidden h-px w-64 bg-white/10 sm:block">
            <div ref={bar} className="h-px w-full origin-left bg-[var(--signal)]" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>

        <div ref={track} className="flex flex-1 items-center will-change-transform">
          <div className="flex w-[80vw] shrink-0 flex-col justify-center px-6 md:w-[55vw] md:px-12 lg:pl-64">
            <h2 className="font-display text-[clamp(40px,7vw,120px)] font-extralight leading-[0.9] tracking-[-0.04em]">
              Cinco
              <br />
              <span className="font-serif italic">paradas.</span>
              <br />
              Ningún <span className="outline-text font-bold">regreso</span>
              <br />
              igual.
            </h2>
            <p className="mt-8 max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-white/40">
              Sigue bajando. El trayecto es horizontal, el destino es vertical. →
            </p>
          </div>

          {STOPS.map((s, i) => (
            <article
              key={s.code}
              className="relative grid h-full w-[92vw] shrink-0 grid-rows-[1fr_auto] items-center gap-6 border-l border-white/[0.07] px-8 pb-24 md:w-[78vw] md:grid-cols-[1.1fr_1fr] md:grid-rows-1 md:px-16"
            >
              <div className="order-2 md:order-1">
                <div className="mb-6 flex items-center gap-4 font-mono text-[10px] tracking-[0.35em] text-white/40">
                  <span className="text-[var(--signal)]">{s.code}</span>
                  <span className="h-px w-12 bg-white/20" />
                  <span className="tabular-nums">{s.dist}</span>
                </div>
                <h3 className="font-display text-[clamp(44px,8.5vw,150px)] font-bold leading-[0.85] tracking-[-0.05em]">
                  {s.name}
                </h3>
                <p className="mt-6 max-w-md font-serif text-[clamp(20px,2.2vw,32px)] italic leading-tight text-white/70">
                  {s.line}
                </p>
                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10">
                  {s.stats.map(([k, v]) => (
                    <div key={k} className="bg-black/60 p-4 backdrop-blur-sm">
                      <dt className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">{k}</dt>
                      <dd className="mt-2 font-mono text-[13px] text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div
                ref={(el) => {
                  visuals.current[i] = el;
                }}
                className="order-1 mx-auto w-[min(48vh,70vw)] will-change-transform md:order-2 md:w-[min(56vh,32vw)]"
              >
                <Visual kind={s.visual} />
              </div>
              <span className="pointer-events-none absolute bottom-10 right-10 font-display text-[18vw] font-black leading-none text-white/[0.025] md:text-[12vw]">
                0{i + 1}
              </span>
            </article>
          ))}
          <div className="w-[10vw] shrink-0" />
        </div>
      </div>
    </section>
  );
}
