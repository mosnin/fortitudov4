import Link from "next/link";

export type NeedItem = { label: string; href: string; count: number };

/**
 * The one place a client looks to know "what's my next action" — open
 * decisions, deliverables to review, milestones to pay, unread messages.
 * Renders nothing when there's nothing to do.
 */
export function NeedsYou({ items }: { items: NeedItem[] }) {
  const live = items.filter((i) => i.count > 0);
  if (live.length === 0) return null;

  return (
    <section className="col-span-12 rounded-3xl border border-orange/25 bg-orange/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-orange/80">Needs you</span>
        <span className="h-px flex-1 bg-orange/15" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {live.map((i) => (
          <Link
            key={i.label}
            href={i.href}
            className="group inline-flex items-center gap-2 rounded-full border border-orange/30 bg-background/40 px-3.5 py-1.5 text-sm transition-colors hover:border-orange/60"
          >
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[11px] font-semibold tabular-nums text-white">
              {i.count}
            </span>
            <span className="text-foreground/80 group-hover:text-foreground">{i.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
