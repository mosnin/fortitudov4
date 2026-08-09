const clients = [
  { name: "MAISON NOIR", className: "font-serif tracking-[0.2em]" },
  { name: "DataPulse", className: "font-bold tracking-tight" },
  { name: "helpstream", className: "font-semibold lowercase tracking-tight" },
  { name: "GROWTHFORGE", className: "font-extrabold tracking-widest" },
  { name: "Atlas Ops", className: "font-serif italic" },
  { name: "Verde Botanica", className: "font-medium tracking-wide" },
  { name: "LOOP", className: "font-mono font-bold tracking-[0.3em]" },
  { name: "Summit & Co.", className: "font-serif" },
];

export function LogoMarquee() {
  return (
    <section
      aria-label="Clients we've built for"
      className="border-y border-line bg-cream py-7 overflow-hidden"
    >
      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-cream to-transparent" />

        <div className="flex w-max animate-marquee gap-16 pr-16">
          {[...clients, ...clients].map((client, i) => (
            <span
              key={`${client.name}-${i}`}
              className={`shrink-0 text-lg text-ink/40 select-none ${client.className}`}
              aria-hidden={i >= clients.length}
            >
              {client.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
