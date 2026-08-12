/**
 * The shell's nav config, and the rule for which row is current.
 *
 * Pure and React-free so both can be asserted without a browser: the shell
 * imports them, `app-shell.tsx` re-exports the type so layouts keep one import,
 * and `nav.test.ts` owns the rule.
 */

export interface ShellNavItem {
  label: string;
  href: string;
  /** lucide icon name, e.g. "LayoutDashboard" — kept serializable so server
   * layouts can pass nav config into this client shell. */
  icon: string;
  /** Match nested routes too (default true; "/admin" uses exact). */
  exact?: boolean;
  /** Mono micro-label group header; consecutive items sharing a section are
   * rendered under one header ("OPERATIONS", "FINANCE", …). */
  section?: string;
}

/**
 * The one active row, decided for the whole nav rather than by each row alone.
 *
 * Most specific match wins. Testing each row independently lights every
 * ancestor at once: on `/partner/requests/new` both "New request" and
 * "Requests" — which owns `/partner` and every request's detail page — read as
 * current. Taking the longest matching href settles it without either entry
 * needing an `exact` flag, and `exact` still means exact for the rows that set
 * it, so the admin nav's `/admin` and `/admin/helix` behave as before.
 *
 * This is `partner-shell.tsx`'s rule, kept when that file was folded back into
 * the shell it was a copy of.
 */
export function activeHref(
  items: readonly ShellNavItem[],
  pathname: string
): string | null {
  let best: string | null = null;
  for (const item of items) {
    const matches = item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");
    if (matches && (best === null || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}
