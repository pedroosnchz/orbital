"use client";

import { RefObject, useEffect, useRef } from "react";

/** Añade la clase `is-in` a todos los `.reveal` (y al propio nodo) al entrar en pantalla. */
export function useReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            e.target.querySelectorAll(".reveal, .rule").forEach((n) => n.classList.add("is-in"));
            io.unobserve(e.target);
          }
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/**
 * Ejecuta `cb` en cada frame con el progreso local (0..1) de una sección "pinned":
 * 0 cuando su parte superior toca el techo del viewport, 1 cuando su base toca el suelo.
 */
export function useScrollFrame<T extends HTMLElement>(
  ref: RefObject<T | null>,
  cb: (p: number, el: T) => void,
) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
        const visible = r.bottom > -100 && r.top < window.innerHeight + 100;
        if (visible && Math.abs(p - last) > 0.00005) {
          last = p;
          cbRef.current(p, el);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ref]);
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
