import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import BoardingForm from "./BoardingForm";
import Scramble from "../Scramble";

async function Manifest() {
  await connection();
  const [count, recent] = await Promise.all([
    prisma.passenger.count(),
    prisma.passenger.findMany({ orderBy: { createdAt: "desc" }, take: 12, select: { callsign: true, seat: true } }),
  ]);
  const names = recent.length
    ? recent.map((p) => `${p.callsign} · ${String(p.seat).padStart(4, "0")}`)
    : ["Asiento 0001 libre", "Sé el primero", "La cabina espera"];
  const loop = [...names, ...names, ...names, ...names];

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
        <span className="font-display text-2xl font-light tracking-tight text-white tabular-nums">
          {String(count).padStart(4, "0")}
        </span>{" "}
        almas en el manifiesto
      </p>
      <div className="mt-16 overflow-hidden border-y border-white/10 py-4 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <div className="marquee flex w-max gap-12 font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">
          {loop.map((n, i) => (
            <span key={i} className="flex items-center gap-12">
              {n}
              <span className="text-[var(--signal)]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Boarding() {
  return (
    <section id="embarque" className="relative flex min-h-[200vh] flex-col justify-end px-6 pb-40 md:px-12 lg:pl-64 lg:pr-24">
      <div className="pointer-events-none absolute inset-x-0 top-[35vh] flex flex-col items-center gap-3 text-center">
        <span className="animate-pulse font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--flare)]">
          ⚠ Anomalía gravitatoria detectada
        </span>
        <span className="font-serif text-xl italic text-white/50">El tiempo empieza a ir más despacio aquí.</span>
      </div>
      <div className="mx-auto w-full max-w-5xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
          <span className="text-[var(--signal)]">05</span> — <Scramble text="Embarque · Puerta Ω-7" />
        </p>
        <h2 className="mt-6 font-display text-[clamp(44px,9vw,160px)] font-extralight leading-[0.82] tracking-[-0.05em] mix-blend-difference">
          Cruza el
          <br />
          <span className="font-serif italic">horizonte.</span>
        </h2>
        <div className="mt-6 mb-20">
          <Suspense
            fallback={<p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">Sincronizando manifiesto…</p>}
          >
            <Manifest />
          </Suspense>
        </div>
        <BoardingForm />
      </div>
    </section>
  );
}
