"use client";

import { useRef } from "react";
import { range, useScrollFrame } from "@/lib/hooks";
import Scramble from "../Scramble";

// *palabra* = acento en serif itálica
const TEXT =
  "Durante *cuatro mil millones* de años la Tierra no ha tenido espectadores. Solo unos pocos cientos de personas la han visto *desde fuera* — y todas volvieron diciendo lo mismo: que nada vuelve a ser igual. No vendemos billetes. Vendemos *perspectiva*.";

const WORDS = TEXT.split(/(\*[^*]+\*|\s+)/).filter((w) => w && !/^\s+$/.test(w));

export default function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const counter = useRef<HTMLSpanElement>(null);

  useScrollFrame(section, (p) => {
    const lp = range(p, 0.08, 0.85);
    const n = words.current.length;
    words.current.forEach((el, i) => {
      if (!el) return;
      const w = range(lp * n, i - 0.5, i + 1.5);
      el.style.opacity = String(0.1 + w * 0.9);
      el.style.filter = `blur(${(1 - w) * 3}px)`;
      el.style.transform = `translateY(${(1 - w) * 0.15}em)`;
    });
    if (counter.current) counter.current.textContent = String(Math.round(lp * 100)).padStart(3, "0");
  });

  return (
    <section id="manifiesto" ref={section} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center px-6 md:px-12 lg:pl-64 lg:pr-24">
        <div className="mb-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
          <span>
            <span className="text-[var(--signal)]">01</span> — <Scramble text="Manifiesto de a bordo" />
          </span>
          <span className="tabular-nums">
            Transmisión <span ref={counter}>000</span>%
          </span>
        </div>
        <p className="max-w-6xl font-display text-[clamp(28px,4.6vw,76px)] font-light leading-[1.08] tracking-[-0.03em]">
          {WORDS.map((w, i) => {
            const accent = w.startsWith("*");
            return (
              <span key={i}>
                <span
                  ref={(el) => {
                    words.current[i] = el;
                  }}
                  className={`inline-block will-change-transform ${
                    accent ? "font-serif text-[1.12em] italic tracking-normal text-[var(--signal)]" : ""
                  }`}
                  style={{ opacity: 0.1 }}
                >
                  {accent ? w.slice(1, -1) : w}
                </span>{" "}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
