/**
 * Estado mutable compartido del viaje. Se actualiza en cada frame (scroll, ratón)
 * y lo leen el shader, el HUD y el cursor sin provocar renders de React.
 */
export const voyage = {
  /** Progreso global de scroll 0..1 */
  progress: 0,
  /** Velocidad de scroll suavizada (px/frame aprox.) */
  velocity: 0,
  /** Ratón normalizado -1..1 */
  mx: 0,
  my: 0,
  /** Ratón en píxeles */
  px: 0,
  py: 0,
  /** Instante (ms) en que arrancó la misión */
  t0: 0,
  /** Ignición completada (tras el preloader) */
  ignited: false,
};

export const ZONES = [
  { at: 0.0, label: "SUPERFICIE", km: 0 },
  { at: 0.1, label: "TROPOSFERA", km: 12 },
  { at: 0.2, label: "LÍNEA DE KÁRMÁN", km: 100 },
  { at: 0.32, label: "ÓRBITA BAJA", km: 408 },
  { at: 0.45, label: "ESPACIO CISLUNAR", km: 384_400 },
  { at: 0.6, label: "CINTURÓN MARCIANO", km: 225_000_000 },
  { at: 0.75, label: "HELIOPAUSA", km: 18_000_000_000 },
  { at: 0.9, label: "ESPACIO PROFUNDO", km: 4.0e13 },
  { at: 1.0, label: "HORIZONTE DE SUCESOS", km: 2.6e17 },
] as const;

/** Distancia (km) interpolada logarítmicamente según el progreso. */
export function distanceAt(p: number) {
  for (let i = 0; i < ZONES.length - 1; i++) {
    const a = ZONES[i];
    const b = ZONES[i + 1];
    if (p <= b.at) {
      const t = (p - a.at) / (b.at - a.at);
      const la = Math.log10(a.km + 1);
      const lb = Math.log10(b.km + 1);
      return Math.pow(10, la + (lb - la) * t) - 1;
    }
  }
  return ZONES[ZONES.length - 1].km;
}

export function zoneAt(p: number) {
  let z: (typeof ZONES)[number] = ZONES[0];
  for (const zone of ZONES) if (p >= zone.at - 0.0001) z = zone;
  return z;
}

export function formatKm(km: number) {
  if (km < 1000) return `${km.toFixed(1)} km`;
  if (km < 1e6) return `${Math.round(km).toLocaleString("es-ES")} km`;
  if (km < 1e9) return `${(km / 1e6).toFixed(2)} M km`;
  if (km < 1e12) return `${(km / 1e9).toFixed(2)} MM km`;
  return `${(km / 9.461e12).toFixed(km < 1e14 ? 2 : 0)} años luz`;
}
