const stack = [
  { name: "Next.js", className: "font-bold tracking-tight" },
  { name: "React", className: "font-semibold" },
  { name: "TypeScript", className: "font-bold tracking-tight" },
  { name: "PostgreSQL", className: "font-serif" },
  { name: "Stripe", className: "font-semibold italic" },
  { name: "Vercel", className: "font-bold tracking-widest uppercase" },
];

export function StackBand() {
  return (
    <section className="bg-cream py-14">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-ink-soft/70 uppercase">
          The stack under the hood
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {stack.map((tech) => (
            <span
              key={tech.name}
              className={`text-xl text-ink/35 select-none sm:text-2xl ${tech.className}`}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
