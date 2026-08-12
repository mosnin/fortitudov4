/**
 * What ⌘K may offer, and to whom.
 *
 * The palette used to build its own list of destinations — seven `/admin/*`
 * routes, hardcoded, gated on nothing — while the shell that mounts it is used
 * by the client portal and the partner surface too. Following one of those
 * bounced the person straight back out of `(admin)`, so it leaked no data, but
 * it advertised the agency's internal structure to a customer and to a third
 * party, and it was a menu of dead ends.
 *
 * The destinations now come from the SAME `navItems` the shell is already
 * drawing, which each layout builds behind its own role checks. That is the
 * honest answer to "where can this person go": one list, gated in one place,
 * and a route the sidebar will not show is a route the palette cannot offer.
 * An explicit per-surface command list would have been a second thing to keep
 * in step with the first, and the bug being fixed here is exactly what happens
 * when a second list drifts out of step.
 *
 * Two ingredients do NOT come from the nav, because they are the agency's own
 * and no nav entry implies them: Helix's "Do" actions and the CRM search that
 * fills the Clients/Projects groups. Both are staff-only, both point at
 * `/admin/*`, and both hang off a single `staffCommands` flag that the admin
 * shell opts into.
 *
 * Deliberately pure and React-free: a command is data (a label and an action to
 * describe), not a closure, so the whole gate can be asserted in a
 * database-free test — see `commands.test.ts`.
 */

/** A place this person can already reach — i.e. one of their own nav rows. */
export interface PaletteDestination {
  label: string;
  href: string;
  /** The nav's own group header ("Workspace", "Operations", …), shown as the
   *  right-hand detail so two same-named rows stay distinguishable. */
  section?: string;
}

/** A hit from the agency CRM search. Staff-only: every one resolves to /admin. */
export interface PaletteSearchHit {
  kind: string;
  id: string;
  label: string;
  detail?: string;
}

/**
 * What running a command does. Described rather than performed, so the palette
 * owns the router and the tests own the gate.
 */
export type CommandAction =
  | { kind: "navigate"; href: string }
  | { kind: "new-helix-thread" };

export interface PaletteCommand {
  id: string;
  label: string;
  detail?: string;
  group: string;
  action: CommandAction;
}

export interface PaletteInput {
  /** This surface's own nav, already role-gated by its layout. */
  destinations: readonly PaletteDestination[];
  /**
   * Staff-only palette content: Helix's "Do" actions and the CRM search hits.
   * Off by default — a surface has to ask for the agency's internals, and the
   * default for a surface that forgets to must be the safe one.
   */
  staffCommands?: boolean;
  /** Results already fetched from the agency CRM. Ignored unless staff. */
  hits?: readonly PaletteSearchHit[];
  /** The typed filter. Empty shows everything. */
  query?: string;
}

/**
 * The whole command set for one surface, in display order: what you can *do*,
 * then what the search found, then where you can go. Someone who reached for
 * ⌘K usually has an intention rather than a destination.
 */
export function buildPaletteCommands({
  destinations,
  staffCommands = false,
  hits = [],
  query = "",
}: PaletteInput): PaletteCommand[] {
  const actions: PaletteCommand[] = staffCommands
    ? [
        {
          id: "new-thread",
          label: "Ask Helix something",
          detail: "Open a new thread",
          group: "Do",
          action: { kind: "new-helix-thread" },
        },
        {
          id: "approvals",
          label: "Review what Helix queued",
          detail: "Approvals",
          group: "Do",
          action: { kind: "navigate", href: "/admin/helix/approvals" },
        },
      ]
    : [];

  const places: PaletteCommand[] = destinations.map((destination) => ({
    id: `open:${destination.href}`,
    label: destination.label,
    detail: destination.section,
    group: "Open",
    action: { kind: "navigate", href: destination.href },
  }));

  const needle = query.trim().toLowerCase();
  const matches = (command: PaletteCommand) =>
    needle.length === 0 ||
    command.label.toLowerCase().includes(needle) ||
    (command.detail ?? "").toLowerCase().includes(needle);

  // Belt and braces: a non-staff palette never fetches these, and if one ever
  // arrived anyway it would be a client row on an /admin href.
  const found: PaletteCommand[] = staffCommands
    ? hits.map((hit) => ({
        id: `${hit.kind}:${hit.id}`,
        label: hit.label,
        detail: hit.detail,
        group: hit.kind === "client" ? "Clients" : "Projects",
        action: {
          kind: "navigate",
          href:
            hit.kind === "client"
              ? `/admin/clients?client=${hit.id}`
              : `/admin/projects/${hit.id}`,
        },
      }))
    : [];

  return [...actions.filter(matches), ...found, ...places.filter(matches)];
}
