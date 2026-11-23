"use client";

import { useEffect, useRef } from "react";
import { range, useReveal, useScrollFrame } from "@/lib/hooks";
import { voyage } from "@/lib/voyage";
import Scramble from "../Scramble";

type V3 = [number, number, number];

/** Geometría de la estación: anillo toroidal, radios, buje y espina con motor. */
function buildGeometry() {
  const lines: { pts: V3[]; kind: "ring" | "struct" | "engine" }[] = [];
  const R = 1, r = 0.11;
  const seg = 96, tube = 10;
  // círculos mayores del toro
  for (let j = 0; j < tube; j++) {
    const v = (j / tube) * Math.PI * 2;
    const pts: V3[] = [];
    for (let i = 0; i <= seg; i++) {
      const u = (i / seg) * Math.PI * 2;
      pts.push([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)]);
    }
    lines.push({ pts, kind: "ring" });
  }
  // secciones del tubo
  for (let i = 0; i < 48; i++) {
    const u = (i / 48) * Math.PI * 2;
    const pts: V3[] = [];
    for (let j = 0; j <= 16; j++) {
      const v = (j / 16) * Math.PI * 2;
      pts.push([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)]);
    }
    lines.push({ pts, kind: "ring" });
  }
  // radios
  for (let k = 0; k < 6; k++) {
    const u = (k / 6) * Math.PI * 2;
    for (const off of [-0.02, 0.02]) {
      lines.push({
        pts: [
          [0.14 * Math.cos(u), off, 0.14 * Math.sin(u)],
          [(R - r) * Math.cos(u), off, (R - r) * Math.sin(u)],
        ],
        kind: "struct",
      });
    }
  }
  // buje + espina (eje Y)
  const cyl = (y0: number, y1: number, rad: number, n: number, kind: "struct" | "engine") => {
    for (const y of [y0, y1]) {
      const pts: V3[] = [];
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        pts.push([rad * Math.cos(a), y, rad * Math.sin(a)]);
      }
      lines.push({ pts, kind });
    }
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      lines.push({ pts: [[rad * Math.cos(a), y0, rad * Math.sin(a)], [rad * Math.cos(a), y1, rad * Math.sin(a)]], kind });
    }
  };
  cyl(-0.12, 0.12, 0.14, 16, "struct");
  cyl(0.12, 1.1, 0.04, 8, "struct");
  cyl(-0.12, -0.6, 0.05, 8, "struct");
  // tobera
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    lines.push({
      pts: [[0.05 * Math.cos(a), -0.6, 0.05 * Math.sin(a)], [0.16 * Math.cos(a), -0.82, 0.16 * Math.sin(a)]],
      kind: "engine",
    });
  }
  const bell: V3[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    bell.push([0.16 * Math.cos(a), -0.82, 0.16 * Math.sin(a)]);
  }
  lines.push({ pts: bell, kind: "engine" });
  return lines;
}

const SPECS = [
  { k: "Diámetro", v: "412 m", pos: "left-[6%] lg:left-[19%] top-[24%]" },
  { k: "Gravedad artificial", v: "0,38 g · 2 rpm", pos: "right-[6%] top-[18%]" },
  { k: "Tripulación + pasajeros", v: "240", pos: "left-[8%] lg:left-[19%] bottom-[24%]" },
  { k: "Propulsión", v: "Fusión D-He3", pos: "right-[8%] bottom-[26%]" },
];

export default function Ship() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scrollP = useRef(0);
  const head = useReveal<HTMLDivElement>(0.3);
  const specs = useRef<(HTMLDivElement | null)[]>([]);

  useScrollFrame(section, (p) => {
    scrollP.current = p;
    specs.current.forEach((el, i) => {
      if (!el) return;
      const s = range(p, 0.15 + i * 0.1, 0.3 + i * 0.1);
      el.style.opacity = String(s);
      el.style.transform = `translateY(${(1 - s) * 20}px)`;
    });
  });

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const geo = buildGeometry();
    let raf = 0;
    let tiltX = 0, tiltY = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = r.width * dpr;
      c.height = r.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const r = c.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const t = now / 1000;
      const p = scrollP.current;
      tiltX += (voyage.my * 0.25 - tiltX) * 0.05;
      tiltY += (voyage.mx * 0.4 - tiltY) * 0.05;
      const spin = t * 0.21 + p * 4; // ~2 rpm visual + scroll
      const pitch = 0.95 - p * 0.75 + tiltX; // de cenital a perfil
      const yaw = -0.3 + p * 0.6 + tiltY;
      const W = c.width, H = c.height;
      const scale = Math.min(W, H) * 0.42 * (0.8 + range(p, 0, 0.5) * 0.25);
      const draw01 = range(p, 0, 0.35); // dibujo progresivo (blueprint)

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      const cs = Math.cos(spin), ss = Math.sin(spin);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const project = ([x, y, z]: V3, rotate: boolean): [number, number, number] => {
        // giro propio alrededor de Y (sólo el anillo/estructura)
        let X = x, Z = z;
        if (rotate) {
          X = x * cs - z * ss;
          Z = x * ss + z * cs;
        }
        // pitch (X) y yaw (Y)
        const Y = y * cp - Z * sp;
        Z = y * sp + Z * cp;
        const X2 = X * cy + Z * sy;
        Z = -X * sy + Z * cy;
        X = X2;
        const persp = 3.2 / (3.2 + Z);
        return [W / 2 + X * scale * persp, H / 2 - Y * scale * persp, Z];
      };

      const total = geo.length;
      geo.forEach((line, li) => {
        if (li / total > draw01 * 1.05 + 0.02) return;
        ctx.beginPath();
        let zsum = 0;
        line.pts.forEach((pt, i) => {
          const [x, y, z] = project(pt, true);
          zsum += z;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        const depth = zsum / line.pts.length; // -1 (cerca) .. 1 (lejos)
        const a = 0.12 + (1 - (depth + 1) / 2) * 0.55;
        if (line.kind === "engine") {
          ctx.strokeStyle = `rgba(255,106,43,${a + 0.2})`;
          ctx.lineWidth = 1.2 * dpr;
        } else if (line.kind === "struct") {
          ctx.strokeStyle = `rgba(198,255,61,${a})`;
          ctx.lineWidth = 0.9 * dpr;
        } else {
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.8})`;
          ctx.lineWidth = 0.6 * dpr;
        }
        ctx.stroke();
      });

      // escape del motor
      const [ex, ey] = project([0, -0.85, 0], true);
      const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, scale * 0.35);
      g.addColorStop(0, `rgba(255,170,90,${0.35 * draw01 + Math.sin(t * 20) * 0.03})`);
      g.addColorStop(1, "rgba(255,106,43,0)");
      ctx.fillStyle = g;
      ctx.fillRect(ex - scale, ey - scale, scale * 2, scale * 2);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section id="nave" ref={section} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="scanlines pointer-events-none absolute inset-0" />
        {/* rejilla de plano técnico */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />

        <canvas ref={canvas} className="absolute inset-0 h-full w-full" data-cursor="Estación ORB-1" />

        <div ref={head} className="pointer-events-none absolute inset-x-0 top-28 px-6 text-center md:px-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
            <span className="text-[var(--signal)]">03</span> — <Scramble text="Estación ORB-1 · Plano técnico" />
          </p>
          <h2 className="reveal mt-4 font-display text-[clamp(36px,6vw,96px)] font-extralight leading-[0.9] tracking-[-0.04em]">
            La nave es <span className="font-serif italic text-[var(--signal)]">el destino.</span>
          </h2>
        </div>

        {SPECS.map((s, i) => (
          <div
            key={s.k}
            ref={(el) => {
              specs.current[i] = el;
            }}
            className={`absolute ${s.pos} hidden max-w-[220px] md:block`}
            style={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 border border-[var(--signal)]" />
              <span className="h-px w-16 bg-gradient-to-r from-[var(--signal)] to-transparent" />
            </div>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">{s.k}</p>
            <p className="mt-1 font-display text-2xl font-light tracking-tight">{s.v}</p>
          </div>
        ))}

        <p className="absolute bottom-24 left-1/2 w-[min(560px,85vw)] -translate-x-1/2 text-center text-sm leading-relaxed text-white/50">
          Un anillo de 412 metros que gira dos veces por minuto para regalarte la gravedad de Marte.
          Ventanales de zafiro, jardines hidropónicos y el único bar con vistas a todo.
        </p>
      </div>
    </section>
  );
}
