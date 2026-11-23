# ORBITAL — Abandona la gravedad

Landing experimental de temática espacial: un viaje desde la superficie de la Tierra hasta el horizonte de sucesos de un agujero negro, recorrido con el scroll.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS 4 · Prisma 7 + SQLite · Lenis

## Arrancar

```bash
npm install          # ejecuta también prisma generate
npx prisma migrate dev
npm run dev
```

## Cómo está montada

| Pieza | Archivo | Qué hace |
|---|---|---|
| Fondo | `src/components/CosmosCanvas.tsx` | Un fragment shader WebGL a pantalla completa que cambia con el progreso del scroll: horizonte nocturno → estrellas con estelas de velocidad → nebulosas → agujero negro con lente gravitacional |
| Motor | `src/components/VoyageEngine.tsx` + `src/lib/voyage.ts` | Lenis + un store mutable (progreso, velocidad, ratón) que se lee en cada frame sin re-renderizar React |
| HUD | `src/components/Hud.tsx` | Altímetro logarítmico, reloj T+, velocidad, coordenadas y navegación |
| Cursor | `src/components/Cursor.tsx` | Retícula con líneas de mira; `data-cursor="texto"` muestra una etiqueta |
| Secciones | `src/components/sections/*` | Hero (tipografía variable + ingravidez), Manifiesto (revelado palabra a palabra), Ruta (scroll horizontal con planetas CSS/SVG), Nave (wireframe 3D en canvas), Clases (pases holográficos), Embarque |
| Datos | `prisma/schema.prisma`, `src/app/actions.ts` | Modelo `Passenger` + server action `reserveSeat` (validación con zod, asignación de asiento) |

Respeta `prefers-reduced-motion` (sin Lenis, ignición rápida, sin animaciones de superficie).
