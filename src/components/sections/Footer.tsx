export default function Footer() {
  return (
    <footer className="relative overflow-hidden px-6 pb-28 pt-24 md:px-12 lg:pl-64">
      <div className="flex flex-wrap items-end justify-between gap-8 border-t border-white/10 pt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        <div className="space-y-2">
          <p className="text-white">ORBITAL Interplanetaria S.A.</p>
          <p>Puerto espacial · 28.5° N · 80.6° O</p>
        </div>
        <div className="flex gap-8">
          <a href="#manifiesto" className="transition-colors hover:text-[var(--signal)]">Manifiesto</a>
          <a href="#ruta" className="transition-colors hover:text-[var(--signal)]">Ruta</a>
          <a href="#embarque" className="transition-colors hover:text-[var(--signal)]">Embarque</a>
        </div>
        <p>© 2026 · Ningún astronauta fue molestado</p>
      </div>
      <p
        aria-hidden
        className="outline-text mt-16 select-none whitespace-nowrap text-center font-display text-[13.5vw] font-black leading-[0.8] tracking-[-0.06em] lg:text-[11vw]"
      >
        FIN DE SEÑAL
      </p>
    </footer>
  );
}
