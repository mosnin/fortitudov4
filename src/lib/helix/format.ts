/**
 * Formatting shared by gatekeeper previews and the approval cards that render
 * them. Kept here rather than in `@/lib/formatting` because these strings are
 * read by the agent as well as the human — they must round-trip unambiguously.
 */

/** Integer cents → `$1,500`. Cents are shown only when they are non-zero. */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toLocaleString('en-US')}`
    : `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** A date as the approval card shows it: `12 Aug 2026`. */
export function formatDay(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Turn a list into prose: `a`, `a and b`, `a, b and c`. */
export function joinWords(words: string[]): string {
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
