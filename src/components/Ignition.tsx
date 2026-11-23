"use client";

import { useEffect, useState } from "react";
import { voyage } from "@/lib/voyage";

const STEPS = ["03", "02", "01", "00"];
const LOG = [
  "SISTEMAS DE SOPORTE VITAL ........ OK",
  "ALINEACIÓN GIROSCÓPICA .......... OK",
  "PRESIÓN DE CABINA ............... 101.3 kPa",
  "PROPULSIÓN ...................... ARMADA",
];

export default function Ignition() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepMs = reduced ? 120 : 620;
    document.documentElement.style.overflow = "hidden";
    const timers: number[] = [];
    STEPS.forEach((_, i) => timers.push(window.setTimeout(() => setStep(i), i * stepMs)));
    const finish = () => {
      setDone(true);
      voyage.ignited = true;
      document.documentElement.style.overflow = "";
      timers.push(window.setTimeout(() => setGone(true), 1400));
    };
    timers.push(window.setTimeout(finish, STEPS.length * stepMs + 150));
    const skip = () => {
      timers.forEach(clearTimeout);
      setStep(STEPS.length - 1);
      finish();
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`ignition fixed inset-0 z-[90] ${done ? "is-done" : ""}`} aria-live="polite">
      <div className="ignition-half top" />
      <div className="ignition-half bottom" />
      <div className="ignition-content absolute inset-0 flex flex-col items-center justify-center">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.5em] text-white/40">Secuencia de ignición</p>
        <div className="relative h-[28vw] max-h-[340px] overflow-hidden">
          <span key={step} className="ignition-digit block font-serif text-[28vw] italic leading-[0.85] text-white md:text-[300px]">
            {STEPS[step]}
          </span>
        </div>
        <div className="mt-10 w-[min(420px,80vw)] space-y-1 font-mono text-[9px] tracking-[0.2em] text-white/40">
          {LOG.slice(0, step + 1).map((l) => (
            <p key={l} className="ignition-log">{l}</p>
          ))}
        </div>
        <div className="mt-6 h-px w-[min(420px,80vw)] bg-white/10">
          <div
            className="h-px bg-[var(--signal)] transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="absolute bottom-10 font-mono text-[9px] uppercase tracking-[0.4em] text-white/25">
          Pulsa cualquier tecla para despegar
        </p>
      </div>
    </div>
  );
}
