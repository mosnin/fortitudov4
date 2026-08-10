'use client';

/**
 * The underline tab strip — the CRM reference's primary page spine. Sits
 * directly under the title: text tabs with a count chip, the active one
 * carrying a 2px foreground rail. Not a segmented pill control.
 */

import { AnimatedNumber, Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export function TabStrip({
  tabs,
  active,
  onChange,
  ariaLabel = 'Filter',
  className,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Reveal variant="fade">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          '-mt-1 flex items-center gap-5 overflow-x-auto border-b border-border/70',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={cn(
                '-mb-px relative inline-flex shrink-0 items-center gap-1.5 pt-0.5 pb-2.5 text-sm transition-colors duration-150 ease-out',
                isActive
                  ? 'font-medium text-foreground'
                  : 'font-normal text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums transition-colors duration-150 ease-out',
                    isActive
                      ? 'bg-foreground/[0.06] text-foreground/70'
                      : 'bg-foreground/[0.04] text-muted-foreground'
                  )}
                >
                  <AnimatedNumber value={tab.count} duration={500} />
                </span>
              )}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute right-0 -bottom-px left-0 h-[2px] rounded-full bg-foreground"
                />
              )}
            </button>
          );
        })}
      </div>
    </Reveal>
  );
}
