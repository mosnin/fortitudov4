'use client';

/**
 * The canonical page header — the three-line pattern from the CRM reference's
 * People/Deals surfaces: a muted section word (with its period), the serif
 * Times h1 revealed word-by-word, and one quiet status sentence.
 *
 * Nothing else belongs here. No texture, no icons, no eyebrow rules.
 */

import { H1, TITLE_FONT, BODY_MUTED } from '@/lib/typography';
import { SplitReveal } from '@/components/motion';
import { cn } from '@/lib/utils';

export function CrmPageHeader({
  section,
  title,
  subtitle,
  action,
  className,
}: {
  /** The section word, e.g. "People." — the period is part of the pattern. */
  section?: string;
  title: string;
  /** One sentence of status, not a description of the page. */
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('space-y-1.5', className)}>
      {action ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            {section && <p className={BODY_MUTED}>{section}</p>}
            <h1 className={H1} style={TITLE_FONT}>
              <SplitReveal as="span" text={title} />
            </h1>
            {subtitle && <p className={BODY_MUTED}>{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        </div>
      ) : (
        <>
          {section && <p className={BODY_MUTED}>{section}</p>}
          <h1 className={H1} style={TITLE_FONT}>
            <SplitReveal as="span" text={title} />
          </h1>
          {subtitle && <p className={BODY_MUTED}>{subtitle}</p>}
        </>
      )}
    </header>
  );
}
