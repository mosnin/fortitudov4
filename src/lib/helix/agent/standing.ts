import type { HelixContext } from '../contract';

/**
 * Where the thread stands, for the list.
 *
 * Derived from what actually happened rather than asked of the model: a
 * second model call per turn to write one line would cost real money and
 * could describe a turn inaccurately. This cannot — it counts rows.
 *
 * Ordered by what would make someone reopen a thread: something blocked on
 * them first, then work waiting, then who it is about.
 */
export function standingFor(
  ctx: HelixContext,
  queued: number,
  requested: number
): string {
  const parts: string[] = [];
  if (requested > 0) {
    parts.push(
      `waiting on access to ${requested} thing${requested === 1 ? '' : 's'}`
    );
  }
  if (queued > 0) {
    parts.push(`${queued} change${queued === 1 ? '' : 's'} queued`);
  }

  const subjects = ctx.introduced
    .filter((ref) => ref.kind === 'client' || ref.kind === 'project')
    .map((ref) => ref.label);
  if (subjects.length === 1) parts.push(subjects[0]);
  else if (subjects.length > 1) {
    parts.push(`${subjects[0]} and ${subjects.length - 1} more`);
  }

  if (parts.length === 0) return 'Nothing outstanding.';
  // Sentence case, since it renders as a line of prose under the title.
  const joined = parts.join(' · ');
  return joined.charAt(0).toUpperCase() + joined.slice(1) + '.';
}
