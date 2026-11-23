"use client";

import { useActionState, useState } from "react";
import { reserveSeat, type BoardingState } from "@/app/actions";
import { DESTINATIONS } from "@/lib/destinations";

const initial: BoardingState = { status: "idle" };

function Barcode({ seed }: { seed: number }) {
  const bars = Array.from({ length: 48 }, (_, i) => {
    const x = Math.sin(seed * 999 + i * 12.9898) * 43758.5453;
    return 1 + Math.floor((x - Math.floor(x)) * 4);
  });
  return (
    <div className="barcode flex h-14 items-stretch gap-[2px]">
      {bars.map((w, i) => (
        <span key={i} style={{ width: w }} />
      ))}
    </div>
  );
}

export default function BoardingForm() {
  const [state, action, pending] = useActionState(reserveSeat, initial);
  const [dest, setDest] = useState<string>(DESTINATIONS[1].id);

  if (state.status === "boarded") {
    return (
      <div className="boarding-pass relative mx-auto w-full max-w-2xl animate-[pass-in_1.2s_cubic-bezier(.2,.8,.2,1)_both] overflow-hidden rounded-[28px] bg-[#f3f1ea] text-black">
        <div className="grid md:grid-cols-[1fr_auto]">
          <div className="p-8">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-black/50">
              <span>ORBITAL · Pase de embarque</span>
              <span>{state.returning ? "Ya a bordo" : "Confirmado"}</span>
            </div>
            <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.3em] text-black/50">Pasajero</p>
            <p className="font-display text-4xl font-bold tracking-[-0.04em]">{state.callsign}</p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/50">Asiento</p>
                <p className="font-display text-3xl font-light">{String(state.seat).padStart(4, "0")}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/50">Puerta</p>
                <p className="font-display text-3xl font-light">Ω-7</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/50">Vuelo</p>
                <p className="font-display text-3xl font-light">001</p>
              </div>
            </div>
            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-black/50">Destino</p>
            <p className="font-serif text-3xl italic">{state.destination}</p>
          </div>
          <div className="flex flex-col items-center justify-between gap-6 border-t border-dashed border-black/20 bg-[var(--signal)] p-8 md:border-l md:border-t-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
              No apto para gravedad
            </span>
            <Barcode seed={state.seat} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mx-auto w-full max-w-3xl">
      <fieldset className="mb-10">
        <legend className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">01 · Destino</legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <label
              key={d.id}
              data-cursor={d.eta}
              className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all duration-500 ${
                dest === d.id
                  ? "border-[var(--signal)] bg-[var(--signal)] text-black"
                  : "border-white/15 bg-black/30 text-white hover:border-white/40"
              }`}
            >
              <input
                type="radio"
                name="destination"
                value={d.id}
                checked={dest === d.id}
                onChange={() => setDest(d.id)}
                className="sr-only"
              />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-60">{d.distance}</span>
              <span className="font-serif text-xl italic leading-tight">{d.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-8 md:grid-cols-2">
        <label className="group block">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">02 · Indicativo</span>
          <input
            name="callsign"
            required
            minLength={2}
            maxLength={24}
            placeholder="Halcón-9"
            autoComplete="nickname"
            className="mt-3 w-full border-b border-white/20 bg-transparent pb-3 font-display text-3xl font-light tracking-tight text-white outline-none transition-colors placeholder:text-white/15 focus:border-[var(--signal)]"
          />
        </label>
        <label className="group block">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">03 · Frecuencia (email)</span>
          <input
            name="email"
            type="email"
            required
            placeholder="tu@tierra.com"
            autoComplete="email"
            className="mt-3 w-full border-b border-white/20 bg-transparent pb-3 font-display text-3xl font-light tracking-tight text-white outline-none transition-colors placeholder:text-white/15 focus:border-[var(--signal)]"
          />
        </label>
      </div>

      <div className="mt-12 flex flex-col items-center gap-5">
        <button
          type="submit"
          disabled={pending}
          data-cursor="Cruzar"
          className="group relative h-20 w-full max-w-md overflow-hidden rounded-full border border-[var(--signal)] font-mono text-xs uppercase tracking-[0.4em] text-[var(--signal)] transition-colors duration-500 hover:text-black disabled:opacity-60"
        >
          <span className="absolute inset-0 origin-bottom scale-y-0 bg-[var(--signal)] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-y-100" />
          <span className="relative">{pending ? "Transmitiendo…" : "Reservar mi asiento →"}</span>
        </button>
        <p aria-live="polite" className="min-h-5 font-mono text-[11px] tracking-[0.15em] text-[var(--flare)]">
          {state.status === "error" ? state.message : ""}
        </p>
      </div>
    </form>
  );
}
