"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DESTINATIONS } from "@/lib/destinations";

export type BoardingState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "boarded";
      seat: number;
      callsign: string;
      destination: string;
      returning: boolean;
    };

const schema = z.object({
  callsign: z
    .string()
    .trim()
    .min(2, "Tu indicativo necesita al menos 2 caracteres.")
    .max(24, "Máximo 24 caracteres. Esto no es una novela."),
  email: z.email("Esa frecuencia no parece válida."),
  destination: z.enum(DESTINATIONS.map((d) => d.id) as [string, ...string[]], {
    error: "Elige un destino.",
  }),
});

export async function reserveSeat(
  _prev: BoardingState,
  formData: FormData,
): Promise<BoardingState> {
  const parsed = schema.safeParse({
    callsign: formData.get("callsign"),
    email: formData.get("email"),
    destination: formData.get("destination"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const { callsign, email, destination } = parsed.data;
  const destName = DESTINATIONS.find((d) => d.id === destination)!.name;

  const existing = await prisma.passenger.findUnique({ where: { email } });
  if (existing) {
    return {
      status: "boarded",
      seat: existing.seat,
      callsign: existing.callsign,
      destination: DESTINATIONS.find((d) => d.id === existing.destination)?.name ?? destName,
      returning: true,
    };
  }

  // Asigna el siguiente asiento libre; reintenta si dos pasajeros embarcan a la vez.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const passenger = await prisma.$transaction(async (tx) => {
        const last = await tx.passenger.findFirst({ orderBy: { seat: "desc" } });
        return tx.passenger.create({
          data: { callsign, email, destination, seat: (last?.seat ?? 0) + 1 },
        });
      });
      revalidatePath("/");
      return {
        status: "boarded",
        seat: passenger.seat,
        callsign: passenger.callsign,
        destination: destName,
        returning: false,
      };
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "P2002") throw err;
    }
  }

  return { status: "error", message: "Interferencia en el canal. Inténtalo de nuevo." };
}
