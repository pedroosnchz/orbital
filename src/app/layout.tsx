import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono, Unbounded } from "next/font/google";
import CosmosCanvas from "@/components/CosmosCanvas";
import VoyageEngine from "@/components/VoyageEngine";
import Hud from "@/components/Hud";
import Cursor from "@/components/Cursor";
import Ignition from "@/components/Ignition";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"], weight: "variable" });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});
const mono = JetBrains_Mono({ variable: "--font-mono-hud", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ORBITAL — Abandona la gravedad",
  description:
    "La primera línea regular entre la superficie terrestre y el espacio profundo. Un viaje de la Tierra al horizonte de sucesos en un solo scroll.",
};

export const viewport: Viewport = {
  themeColor: "#020205",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${unbounded.variable} ${instrument.variable} ${mono.variable} antialiased`}
    >
      <body>
        <CosmosCanvas />
        <VoyageEngine />
        <Ignition />
        <Hud />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
