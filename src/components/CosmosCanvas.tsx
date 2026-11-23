"use client";

import { useEffect, useRef } from "react";
import { voyage } from "@/lib/voyage";

const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uProg;
uniform float uVel;
uniform vec2 uMouse;
uniform float uIgnite;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

vec3 starLayer(vec2 uv, float scale, float depth, float stretch, float density) {
  vec2 p = uv * scale + uMouse * depth * 0.35;
  p.y += uProg * depth * 60.0 + uTime * 0.03 * depth;
  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;
  float h = hash(id);
  if (h < density) return vec3(0.0);
  vec2 o = (vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5) * 0.7;
  vec2 d = f - o;
  d.y /= 1.0 + stretch * depth;
  float r = length(d);
  float b = (h - density) / (1.0 - density);
  float tw = 0.55 + 0.45 * sin(uTime * (1.0 + h * 6.0) + h * 40.0);
  float core = pow(max(0.0, 1.0 - r * (16.0 - b * 8.0)), 4.0);
  float halo = 0.0025 * b / (r * r + 0.002);
  vec3 tint = mix(vec3(0.65, 0.78, 1.0), vec3(1.0, 0.82, 0.62), hash(id + 3.7));
  return tint * (core * 1.6 + halo * 0.35) * tw * b;
}

vec3 nebula(vec2 uv) {
  vec2 q = uv * 1.3 + vec2(0.0, uProg * 2.5) + uMouse * 0.05;
  vec2 w = vec2(fbm(q + uTime * 0.012), fbm(q + vec2(5.2, 1.3) - uTime * 0.01));
  float n = fbm(q + 2.2 * w);
  vec3 a = vec3(0.05, 0.55, 0.6);   // cian
  vec3 b = vec3(0.45, 0.12, 0.85);  // violeta
  vec3 c = vec3(0.95, 0.25, 0.35);  // magenta
  vec3 d = vec3(1.0, 0.55, 0.15);   // ámbar
  float t = uProg;
  vec3 c1 = mix(a, b, smoothstep(0.3, 0.55, t));
  vec3 c2 = mix(b, c, smoothstep(0.5, 0.72, t));
  c2 = mix(c2, d, smoothstep(0.7, 0.9, t));
  vec3 col = mix(c1, c2, smoothstep(0.35, 0.8, n + w.x * 0.3));
  float mask = pow(smoothstep(0.38, 0.95, n), 2.2);
  return col * mask;
}

vec3 sky(vec2 uv) {
  float vel = clamp(uVel, 0.0, 1.0);
  vec3 col = vec3(0.0);
  col += starLayer(uv, 9.0, 0.25, vel * 20.0, 0.82) * 0.55;
  col += starLayer(uv, 5.0, 0.55, vel * 20.0, 0.88) * 0.8;
  col += starLayer(uv, 2.6, 1.0, vel * 20.0, 0.93);
  float nebAmt = smoothstep(0.18, 0.4, uProg) * (1.0 - 0.4 * smoothstep(0.9, 1.0, uProg));
  col += nebula(uv) * nebAmt * 0.85;
  return col;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uRes) / uRes.y;

  // Túnel de velocidad: empuja el espacio hacia fuera al hacer scroll rápido
  float vel = clamp(uVel, 0.0, 1.0);
  uv *= 1.0 - vel * 0.06 * length(uv);

  // ---------- Agujero negro (zona final) ----------
  float bh = smoothstep(0.8, 1.0, uProg);
  vec2 bc = vec2(0.0, 0.02) + uMouse * 0.04;
  float rs = 0.16 * bh;
  vec2 q = uv - bc;
  float r = length(q);
  vec2 luv = uv;
  if (bh > 0.0) {
    // Lente gravitacional: desvía los rayos alrededor de la masa
    luv = uv - normalize(q) * (rs * rs * 1.6) / max(r, 0.001);
  }

  vec3 col = sky(luv);

  // ---------- Tierra: horizonte nocturno ----------
  float horizon = mix(-0.28, -2.4, smoothstep(0.0, 0.24, uProg));
  float R = 3.2;
  vec2 ec = vec2(uMouse.x * 0.03, horizon - R);
  float de = length(uv - ec) - R;
  // Cielo atmosférico (se apaga al ganar altitud)
  float atmoFade = 1.0 - smoothstep(0.02, 0.22, uProg);
  vec3 skyTint = mix(vec3(0.02, 0.06, 0.16), vec3(0.0), smoothstep(0.0, 1.2, de));
  col = mix(col, col * 0.35 + skyTint, atmoFade * 0.9);
  // Halo atmosférico
  float rim = exp(-max(de, 0.0) * 28.0) * 0.9 + exp(-max(de, 0.0) * 5.0) * 0.25;
  col += vec3(0.25, 0.55, 1.0) * rim * (1.0 - smoothstep(0.15, 0.3, uProg));
  if (de < 0.0) {
    // Superficie nocturna con luces de ciudades
    vec2 sp = (uv - ec) * 3.0 + vec2(uTime * 0.01, 0.0);
    float land = smoothstep(0.48, 0.56, fbm(sp * 1.4));
    vec3 surf = vec3(0.004, 0.01, 0.025) + land * vec3(0.01, 0.012, 0.016);
    vec2 cp = sp * 90.0;
    float city = step(0.93, hash(floor(cp))) * land;
    city *= 0.5 + 0.5 * sin(uTime * 2.0 + hash(floor(cp)) * 30.0);
    surf += vec3(1.0, 0.6, 0.25) * city * 0.9 * smoothstep(0.0, -0.4, de * 3.0 + 0.1);
    float limb = smoothstep(-0.25, 0.0, de);
    surf += vec3(0.1, 0.3, 0.8) * limb * 0.35;
    col = mix(col, surf, smoothstep(0.0, -0.004, de));
  }

  // ---------- Disco de acreción ----------
  if (bh > 0.0) {
    vec2 dq = q;
    dq.y /= 0.22; // inclinación del disco
    float dr = length(dq);
    float srs = max(rs, 0.01);
    float inner = rs * 1.6, outer = rs * 4.6;
    float band = smoothstep(inner, inner * 1.12, dr) * (1.0 - smoothstep(inner * 1.25, outer, dr));
    // rotación diferencial (Kepler: el interior gira más rápido) sin discontinuidad angular
    float rot = uTime * 0.35 * pow(srs / max(dr, 0.001), 1.5);
    vec2 dir = dq / max(dr, 0.001);
    vec2 rd = vec2(dir.x * cos(rot) - dir.y * sin(rot), dir.x * sin(rot) + dir.y * cos(rot));
    float swirl = fbm(rd * 2.5 + vec2(dr / srs * 3.0, 0.0));
    float streak = noise(vec2(dr / srs * 22.0, 0.0) + rd * 0.6);
    float doppler = 1.0 + 0.85 * dir.x;
    float heat = smoothstep(outer, inner, dr);
    vec3 hot = mix(vec3(1.0, 0.32, 0.06), vec3(1.0, 0.95, 0.85), heat * heat);
    vec3 disk = hot * band * (0.35 + 1.5 * swirl + 0.4 * streak) * doppler * 1.6;
    vec3 diskGlow = vec3(1.0, 0.45, 0.15) * exp(-abs(dr - inner * 1.4) / srs * 1.2) * 0.18;

    // Arco lensado: la parte trasera del disco vista por encima y por debajo del horizonte
    float arcBand = smoothstep(rs * 1.08, rs * 1.2, r) * (1.0 - smoothstep(rs * 1.35, rs * 1.9, r));
    float arcUp = arcBand * smoothstep(-0.3 * rs, 0.9 * rs, q.y);
    float arcDown = arcBand * smoothstep(0.2 * rs, -1.0 * rs, q.y) * 0.35;
    vec3 arc = mix(vec3(1.0, 0.4, 0.1), vec3(1.0, 0.9, 0.75), 0.6) * (arcUp + arcDown) * (0.5 + swirl) * (1.0 + 0.5 * q.x / max(r, 0.001));

    // Anillo de fotones
    float ring = exp(-abs(r - rs * 1.04) / srs * 60.0);
    vec3 photon = vec3(1.0, 0.85, 0.65) * ring * 1.6;

    bool front = q.y < 0.0;
    // detrás del agujero: disco sólo fuera del horizonte
    if (!front) col += (disk + diskGlow) * step(rs, r) * bh;
    col += (photon + arc) * bh;
    col *= smoothstep(rs * 0.97, rs * 1.01, r); // horizonte de sucesos
    if (front) col += (disk + diskGlow) * bh;
    // halo tenue
    col += vec3(1.0, 0.45, 0.15) * 0.05 * bh * rs / max(r, 0.01);
  }

  // Ignición: fundido desde negro
  col *= uIgnite;

  // Viñeta, tonemapping y grano
  vec2 vuv = frag / uRes;
  col *= 0.55 + 0.45 * pow(16.0 * vuv.x * vuv.y * (1.0 - vuv.x) * (1.0 - vuv.y), 0.25);
  col = 1.0 - exp(-col * 1.25);
  col = pow(col, vec3(0.92));
  col += (hash(frag + fract(uTime) * 100.0) - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
  }
  return s;
}

export default function CosmosCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" });
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      prog: gl.getUniformLocation(prog, "uProg"),
      vel: gl.getUniformLocation(prog, "uVel"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      ignite: gl.getUniformLocation(prog, "uIgnite"),
    };

    // Resolución adaptativa: el shader es suave, no necesita píxeles retina.
    const scale = Math.min(window.devicePixelRatio, 1.5) * 0.75;
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const start = performance.now();
    let mx = 0, my = 0, prog_ = 0, ignite = 0;
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      mx += (voyage.mx - mx) * 0.05;
      my += (voyage.my - my) * 0.05;
      prog_ += (voyage.progress - prog_) * 0.08;
      ignite += ((voyage.ignited ? 1 : 0.15) - ignite) * 0.03;
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.prog, prog_);
      gl.uniform1f(u.vel, Math.min(Math.abs(voyage.velocity) / 60, 1));
      gl.uniform2f(u.mouse, mx, -my);
      gl.uniform1f(u.ignite, ignite);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
