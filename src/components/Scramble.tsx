"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "ΔΣΩ∆◊※⌁⌖⏃⏚01<>/\\|#*+=";

/** Texto que se "decodifica" como una transmisión al entrar en pantalla. */
export default function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const dur = 900 + text.length * 25;
      const tick = (now: number) => {
        const t = (now - start) / dur;
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          const reveal = i / text.length;
          if (ch === " " || t > reveal * 0.8 + 0.2) out += ch;
          else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        el.textContent = out;
        if (t < 1) raf = requestAnimationFrame(tick);
        else el.textContent = text;
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}
