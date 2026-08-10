/**
 * A section heading over a hairline rule — the quiet divider between blocks
 * on a page. Text only: no glyphs, no eyebrow rules.
 */

import { H3 } from '@/lib/typography';
import { cn } from '@/lib/utils';

export function SectionHead({
  title,
  meta,
  className,
}: {
  title: React.ReactNode;
  /** Right-aligned caption, e.g. "Last 6 months". */
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 border-b border-border/60 pb-2.5',
        className
      )}
    >
      <h2 className={H3}>{title}</h2>
      {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
    </div>
  );
}
