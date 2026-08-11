'use client';

/**
 * "Four moves, and nothing else" — the Helix OS primitives, on the logged-out
 * site.
 *
 * This is the one section that has to earn the word *agentic*, so it does not
 * describe a capability, it describes a constraint. Every cell is the actual
 * shape of the system in `src/lib/helix/`: a thread starts able to touch
 * nothing, an introduction is granted per-thread by a human, an action is
 * simulated before it is ever written, and a gadget can read but never write.
 * If any of those four stops being true in the code, the copy here is wrong
 * and should change with it.
 *
 * Visually it is the hero-21 language: a hairline grid with no gaps between
 * cells, mono indices, squared corners, and yellow spent only on the rule that
 * marks the cell you are pointing at.
 */

import { Band, BlurRise, Eyebrow, Serif } from './primitives';

const MONO = { fontFamily: 'var(--font-mono)' } as const;

type Primitive = {
  index: string;
  name: string;
  line: string;
  body: string;
};

const PRIMITIVES: Primitive[] = [
  {
    index: '01',
    name: 'Thread',
    line: 'Starts with nothing',
    body: 'A working session with the agent. On the first message it can read nothing and write nothing — not your clients, not your invoices, not a single task. Access is something it has to be given, one thing at a time.',
  },
  {
    index: '02',
    name: 'Introduction',
    line: 'A person decides',
    body: 'Helix asks to be introduced to a client, a project, a report. Someone here says yes or no, and that grant covers that thread only. Read-only is a real answer: a thread without write access is refused outright, not quietly queued.',
  },
  {
    index: '03',
    name: 'Action',
    line: 'Simulated before it is real',
    body: 'Nothing is written on the first pass. Every change is described, previewed, and run against a simulated copy — and the agent keeps reading through that copy, so it stays consistent and keeps working while it waits for you.',
  },
  {
    index: '04',
    name: 'Gadget',
    line: 'Reads, never writes',
    body: 'Small private tools Helix writes for one client — a tracker, a calculator, a live dashboard. They run sandboxed on an opaque origin with no network at all, and they cannot write anything, ever. Generated code does not get a pen.',
  },
];

export function HelixPrimitives() {
  return (
    <section className="relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] py-24 text-[var(--fx-white)] sm:py-32">
      <Band>
        <BlurRise className="max-w-3xl">
          <Eyebrow>Helix OS</Eyebrow>
          <Serif className="mt-5 text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.06] text-[var(--fx-white)]">
            Four moves, and{' '}
            <span className="text-[var(--fx-yellow)]">nothing else.</span>
          </Serif>
          <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-[var(--fx-muted)]">
            Most &ldquo;AI agents&rdquo; are a chat box with your database
            behind it. Ours is four primitives with a person standing between
            each one, and the smallest of them is the most important.
          </p>
        </BlurRise>

        {/* No gaps: the grid is drawn with rules, so the cells share edges.
            Each cell carries its top and left hairline and the container
            closes the right and bottom, which keeps the frame square however
            the columns wrap. */}
        <div className="mt-14 grid border-r border-b border-[var(--fx-hairline)] sm:grid-cols-2 lg:grid-cols-4">
          {PRIMITIVES.map((primitive, i) => (
            <BlurRise
              key={primitive.name}
              delay={0.06 * i}
              className="group border-t border-l border-[var(--fx-hairline)] bg-transparent transition-colors duration-300 hover:bg-white/[0.02]"
            >
              <div className="flex h-full flex-col p-7 lg:p-8">
                <div className="flex items-baseline justify-between">
                  <span
                    style={MONO}
                    className="text-[11px] tracking-[0.2em] text-[var(--fx-faint)]"
                  >
                    {primitive.index}
                  </span>
                  <span
                    style={MONO}
                    className="text-[10px] tracking-[0.18em] text-[var(--fx-faint)] uppercase"
                  >
                    {primitive.line}
                  </span>
                </div>

                {/* The one piece of yellow in the cell: a rule that fills on
                    hover. It marks where you are, and marks nothing else. */}
                <span
                  aria-hidden
                  className="mt-6 block h-px w-8 bg-[var(--fx-yellow)] transition-all duration-500 ease-out group-hover:w-full"
                />

                <Serif
                  as="h3"
                  className="mt-6 text-[28px] leading-none text-[var(--fx-white)]"
                >
                  {primitive.name}
                </Serif>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[var(--fx-muted)]">
                  {primitive.body}
                </p>
              </div>
            </BlurRise>
          ))}
        </div>

        <BlurRise delay={0.1}>
          <p
            style={MONO}
            className="mt-6 text-[11px] leading-relaxed tracking-[0.14em] text-[var(--fx-faint)] uppercase"
          >
            Your clients&apos; own threads are read-only, always — a client has
            no authority over their delivery stage or their fees
          </p>
        </BlurRise>
      </Band>
    </section>
  );
}
