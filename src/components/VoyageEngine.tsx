"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { voyage } from "@/lib/voyage";

/**
 * Motor del viaje: scroll suave con inercia (Lenis), progreso, velocidad
 * y posición del ratón publicados en el store `voyage`. También expone
 * --p (progreso) y --v (velocidad) como variables CSS en <html>.
 */
export default function VoyageEngine() {
  useEffect(() => {
    voyage.t0 = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    const lenis = reduced
      ? null
      : new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.4 });

    // Permite que otros componentes (p.ej. el nav) lancen scrolls suaves
    (window as unknown as { __lenis?: Lenis | null }).__lenis = lenis;

    let raf = 0;
    let lastY = window.scrollY;
    const tick = (time: number) => {
      lenis?.raf(time);
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      voyage.progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      const instant = y - lastY;
      lastY = y;
      voyage.velocity += (instant - voyage.velocity) * 0.15;
      root.style.setProperty("--p", voyage.progress.toFixed(4));
      root.style.setProperty("--v", Math.min(Math.abs(voyage.velocity) / 60, 1).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      voyage.px = e.clientX;
      voyage.py = e.clientY;
      voyage.mx = (e.clientX / window.innerWidth) * 2 - 1;
      voyage.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      lenis?.destroy();
    };
  }, []);

  return null;
}

export function scrollToTarget(target: string | number) {
  const lenis = (window as unknown as { __lenis?: Lenis | null }).__lenis;
  if (lenis) lenis.scrollTo(target as never, { duration: 2.2 });
  else if (typeof target === "string") document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: target, behavior: "smooth" });
}
