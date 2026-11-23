export const DESTINATIONS = [
  { id: "karman", name: "Línea de Kármán", distance: "100 km", eta: "T+ 00:08:40" },
  { id: "luna", name: "Mar de la Tranquilidad", distance: "384 400 km", eta: "T+ 3d 04h" },
  { id: "marte", name: "Valles Marineris", distance: "225 M km", eta: "T+ 212d" },
  { id: "helio", name: "Heliopausa", distance: "18 000 M km", eta: "T+ 41 años" },
] as const;

export type DestinationId = (typeof DESTINATIONS)[number]["id"];
