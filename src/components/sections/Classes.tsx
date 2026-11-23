"use client";

import { PointerEvent } from "react";
import { useReveal } from "@/lib/hooks";
import Scramble from "../Scramble";

const CLASSES = [
  {
    code: "SUB",
    name: "Suborbital",
    tag: "Bautismo",
    price: "250 000 €",
    dur: "11 min",
    perks: ["4 min de ingravidez", "Curvatura terrestre visible", "Ventana panorámica individual"],
    accent: "#3dd9ff",
  },
  {
    code: "ORB",
    name: "Orbital",
    tag: "Más reservada",
    price: "1,2 M €",
    dur: "6 días",
    perks: ["96 amaneceres", "Camarote en el anillo ORB-1", "Paseo extravehicular guiado"],
    accent: "#c6ff3d",
    featured: true,
  },
  {
    code: "PRF",
    name: "Profundo",
    tag: "Solo ida, opcional",
    price: "Bajo solicitud",
    dur: "212 días +",
    perks: ["Inserción en órbita marciana", "Criosueño de cortesía", "Tu nombre en la placa de la nave"],
    accent: "#ff6a2b",
  },
];

function tilt(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", `${(x - 0.5) * 18}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
}
function reset(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--rx", "0deg");
}

export default function Classes() {
  const ref = useReveal<HTMLElement>(0.15);

  return (
    <section id="clases" ref={ref} className="relative px-6 py-40 md:px-12 lg:pl-64 lg:pr-24">
      <div className="mb-20 grid gap-8 md:grid-cols-2 md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
            <span className="text-[var(--signal)]">04</span> — <Scramble text="Clases de vuelo" />
          </p>
          <h2 className="reveal mt-6 font-display text-[clamp(40px,6.5vw,110px)] font-extralight leading-[0.88] tracking-[-0.045em]">
            Elige tu
            <br />
            <span className="font-serif italic">órbita.</span>
          </h2>
        </div>
        <p className="reveal max-w-sm text-white/50 md:justify-self-end" style={{ "--d": ".2s" } as React.CSSProperties}>
          Tres formas de dejar de mirar hacia arriba. Todas incluyen entrenamiento de 9 semanas,
          traje a medida y el derecho a no volver a quejarte de un vuelo con escala.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {CLASSES.map((c, i) => (
          <div key={c.code} className="reveal" style={{ "--d": `${0.1 + i * 0.12}s` } as React.CSSProperties}>
          <article
            onPointerMove={tilt}
            onPointerLeave={reset}
            data-cursor={`Clase ${c.name}`}
            className={`holo group relative flex min-h-[560px] flex-col overflow-hidden rounded-[28px] border bg-black/50 p-8 backdrop-blur-xl ${
              c.featured ? "border-[var(--signal)]/50 lg:-translate-y-8" : "border-white/10"
            }`}
          >
            <div className="holo-foil pointer-events-none absolute inset-0 rounded-[28px]" />
            {/* troquel del pase */}
            <span className="absolute -left-3 top-[62%] h-6 w-6 rounded-full bg-[var(--void)] ring-1 ring-white/10" />
            <span className="absolute -right-3 top-[62%] h-6 w-6 rounded-full bg-[var(--void)] ring-1 ring-white/10" />

            <header className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.3em]">
              <span className="text-white/40">Pase de embarque</span>
              <span className="rounded-full border px-3 py-1" style={{ borderColor: c.accent, color: c.accent }}>
                {c.tag}
              </span>
            </header>

            <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Duración → {c.dur}</p>
            <span
              className="mt-2 block font-display text-[clamp(64px,6vw,96px)] font-black leading-none tracking-[-0.06em]"
              style={{ color: c.accent }}
            >
              {c.code}
            </span>
            <h3 className="font-serif text-5xl italic">{c.name}</h3>

            <ul className="mt-8 space-y-3 text-sm text-white/60">
              {c.perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="h-1 w-1 rotate-45" style={{ background: c.accent }} />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t border-dashed border-white/15 pt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">Tarifa</p>
                  <p className="mt-1 whitespace-nowrap font-display text-2xl font-light tracking-tight">{c.price}</p>
                </div>
                <div className="barcode flex h-10 items-stretch gap-[2px] text-white/70">
                  {Array.from({ length: 14 }, (_, k) => (
                    <span key={k} style={{ width: ((k * 7 + i * 3) % 4) + 1 }} />
                  ))}
                </div>
              </div>
            </div>
          </article>
          </div>
        ))}
      </div>
    </section>
  );
}
