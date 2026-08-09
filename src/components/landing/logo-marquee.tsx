const clients = [
  "MAISON NOIR",
  "DataPulse",
  "helpstream",
  "GROWTHFORGE",
  "Atlas Ops",
  "Verde Botanica",
  "LOOP",
  "Summit & Co.",
];

export function LogoMarquee() {
  return (
    <section
      aria-label="Clients we've built for"
      className="relative overflow-hidden border-b border-line bg-band py-8"
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-band to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-band to-transparent" />

        <div className="flex w-max animate-marquee items-center gap-20 pr-20">
          {[...clients, ...clients].map((name, i) => (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= clients.length}
              className="shrink-0 font-mono text-[18px] font-medium tracking-[-0.015em] text-[#9E9E9E] select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
