import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Route from "@/components/sections/Route";
import Ship from "@/components/sections/Ship";
import Classes from "@/components/sections/Classes";
import Boarding from "@/components/sections/Boarding";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Manifesto />
      <Route />
      <Ship />
      <Classes />
      <Boarding />
      <Footer />
    </main>
  );
}
