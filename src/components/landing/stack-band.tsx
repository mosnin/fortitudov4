const stack = [
  "Next.js",
  "React",
  "TypeScript",
  "PostgreSQL",
  "Stripe",
  "Vercel",
];

/** Serif wordmark band above the footer, in the reference's press-band style. */
export function StackBand() {
  return (
    <section className="relative border-b border-line bg-cream py-10">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-14 gap-y-5 px-6">
        {stack.map((name) => (
          <span
            key={name}
            className="font-serif text-[22px] tracking-[-0.01em] text-[#9E9E9E] select-none md:text-[26px]"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
