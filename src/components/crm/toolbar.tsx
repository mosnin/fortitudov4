'use client';

/**
 * The single filter row — the CRM reference's toolbar: a search field on the
 * left, everything else pushed right. Filter triggers are square-ish bordered
 * buttons with a muted prefix ("Stage: All"), not pills, and never carry a
 * decorative glyph.
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function Toolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  );
}

export function ToolbarSearch({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative min-w-[160px] flex-1 sm:flex-initial', className)}>
      <Search
        size={14}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder={placeholder}
        className="h-9 w-full border-border/70 bg-background pl-9 sm:w-64"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Right-hand cluster — everything after the search field. */
export function ToolbarActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
  );
}

/** A bordered filter trigger: `Label: Value`. Wrap a native select or use as a
 *  dropdown trigger. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label
      className={cn(
        'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border/70 bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.04]',
        className
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-medium outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
