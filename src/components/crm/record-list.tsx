'use client';

/**
 * The record row vocabulary — lifted from the CRM reference's ContactRow, the
 * canonical surface. A `divide-y` list; each row is a bleeding-edge rounded
 * hover target with a primary line (name + status pill), a truncating
 * secondary line, and right-hand metadata whose action icons fade in on hover.
 *
 * This is the default for ANY list of records. Never a grid of heavy cards.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { EASE_APPLE } from '@/lib/motion';
import { STATUS_PILL, STATUS_PILL_ACTIVE } from '@/lib/typography';
import { cn } from '@/lib/utils';

export function RecordList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ul className={cn('divide-y divide-border/60', className)}>{children}</ul>;
}

export function RecordRow({
  href,
  onClick,
  primary,
  status,
  secondary,
  meta,
  actions,
  index = 0,
  animate = true,
  selected = false,
  className,
}: {
  href?: string;
  /** Fires on activation. Set alongside `href` to run a side effect (marking
   *  a notification read) as the row navigates. */
  onClick?: () => void;
  /** The record's name — the line the eye lands on. */
  primary: React.ReactNode;
  /** Neutral word pill beside the name. */
  status?: React.ReactNode;
  /** One truncating line of context. Use ` · ` between facts. */
  secondary?: React.ReactNode;
  /** Always-visible right-hand metadata (dates, counts). */
  meta?: React.ReactNode;
  /** Hover-revealed controls. Use `RowAction`. */
  actions?: React.ReactNode;
  index?: number;
  animate?: boolean;
  selected?: boolean;
  /** Per-row emphasis, e.g. dimming a completed record. */
  className?: string;
}) {
  const rowClassName = cn(
    'group/row -mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors duration-150 ease-out',
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset focus-visible:outline-none',
    selected ? 'bg-muted/40' : 'hover:bg-muted/30',
    className
  );

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {primary}
          </span>
          {status}
        </div>
        {secondary && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {secondary}
          </div>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {meta}
        {/* Touch surfaces can't hover, so the controls stay visible there;
            at lg+ they fade in on row hover as in the reference. */}
        {actions && (
          <div className="flex gap-0.5 transition-opacity duration-150 lg:opacity-0 lg:group-hover/row:opacity-100 lg:group-focus-within/row:opacity-100">
            {actions}
          </div>
        )}
        {href && !actions && (
          <ChevronRight
            size={14}
            className="flex-shrink-0 text-muted-foreground/40 lg:hidden"
            aria-hidden
          />
        )}
      </div>
    </>
  );

  return (
    <motion.li
      initial={animate ? { opacity: 0, y: 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE_APPLE, delay: Math.min(index, 12) * 0.02 }}
    >
      {href ? (
        <Link href={href} onClick={onClick} className={cn(rowClassName, 'cursor-pointer')}>
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={cn(rowClassName, 'w-full cursor-pointer text-left')}>
          {body}
        </button>
      ) : (
        <div className={rowClassName}>{body}</div>
      )}
    </motion.li>
  );
}

/** A hover-revealed row control: icon-only, 7×7, quiet until reached for. */
export function RowAction({
  label,
  onClick,
  href,
  destructive = false,
  disabled = false,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  /** Mutation in flight — the control greys out and stops accepting input. */
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const className = cn(
    'flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
    disabled
      ? 'pointer-events-none opacity-40'
      : destructive
        ? 'hover:bg-destructive/10 hover:text-destructive'
        : 'hover:bg-muted hover:text-foreground'
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} onClick={(e) => e.stopPropagation()} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      className={className}
    >
      {children}
    </button>
  );
}

/**
 * The neutral status word pill that sits beside a record's name.
 *
 * It renders `STATUS_PILL` / `STATUS_PILL_ACTIVE` verbatim rather than a
 * lookalike of them, so a row pill, a `Badge` and a pill dropped inline on a
 * page are one object with one silhouette (design.md: neutral, bordered, 10px
 * uppercase).
 */
export function RowPill({
  children,
  emphasis = false,
  className,
}: {
  children: React.ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex-shrink-0',
        emphasis ? STATUS_PILL_ACTIVE : STATUS_PILL,
        className
      )}
    >
      {children}
    </span>
  );
}

/** Loading skeleton that mirrors the row vocabulary exactly. */
export function RecordListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/60">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16" />
        </li>
      ))}
    </ul>
  );
}

/**
 * The silhouette of any control that lives in a row's `meta` slot — a status
 * select, a due-date input. h-8, hairline, xs.
 *
 * Exported as a string as well as a component because a row's controls are not
 * all selects: the tasks list puts a native `<input type="date">` beside two
 * dropdowns, and three admin pages had each invented their own row-control
 * class (`border-border/70` here, `border-transparent` there, a `text-center`
 * variant in a third) so the same row read differently on every screen.
 */
export const ROW_CONTROL =
  'h-8 cursor-pointer rounded-md border border-border bg-background px-2 text-xs ' +
  'text-foreground transition-colors hover:bg-foreground/[0.04] ' +
  'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/** The inline control that lives in a row's `meta` slot (a status select, a
 *  date input). One silhouette everywhere: h-8, hairline, xs. */
export function RowSelect({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(ROW_CONTROL, className)} {...props}>
      {children}
    </select>
  );
}
