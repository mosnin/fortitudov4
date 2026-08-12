/**
 * The ⌘K gate.
 *
 * The palette used to hold its own list of destinations — seven `/admin/*`
 * routes, hardcoded, gated on nothing — inside a shell the client portal also
 * mounts. A client pressing ⌘K was offered Threads, Gadgets, Activity,
 * Clients, Tasks, Projects and Messages; following one bounced them back out of
 * `(admin)`, so nothing leaked, but the menu named the agency's internal
 * structure to a customer and every entry was a dead end.
 *
 * So the assertion that matters is a negative one, and it is made against the
 * real nav each layout builds: NOTHING a client or a partner can reach through
 * this palette points at `/admin`. It is checked on the whole command set
 * rather than on the "Open" group, because the Helix actions are `/admin` too
 * and they are the half a reader is most likely to forget.
 *
 * Database-free and browser-free by construction: `buildPaletteCommands`
 * describes a command's action instead of performing it, so the gate is
 * ordinary data to assert on.
 */

import { describe, expect, it } from "vitest";
import {
  buildPaletteCommands,
  type PaletteCommand,
  type PaletteDestination,
} from "./commands";

/**
 * The client portal's nav, copied from `src/app/(dashboard)/layout.tsx`,
 * including the Weekly Reports row that only digital-marketing clients get.
 */
const CLIENT_NAV: PaletteDestination[] = [
  { label: "Dashboard", href: "/dashboard", section: "Workspace" },
  { label: "Projects", href: "/projects", section: "Workspace" },
  { label: "Messages", href: "/messages", section: "Workspace" },
  { label: "Weekly Reports", href: "/reports", section: "Workspace" },
  { label: "Ask Helix", href: "/helix", section: "Workspace" },
  { label: "Payments", href: "/payments", section: "Workspace" },
  { label: "Analytics", href: "/analytics", section: "Workspace" },
  { label: "Tools", href: "/tools", section: "Workspace" },
  { label: "Guides", href: "/guides", section: "Learn" },
  { label: "Notifications", href: "/notifications", section: "Account" },
  { label: "Settings", href: "/settings", section: "Account" },
];

/** The partner surface's nav, copied from `src/app/(partner)/layout.tsx`. */
const PARTNER_NAV: PaletteDestination[] = [
  { label: "Requests", href: "/partner" },
  { label: "New request", href: "/partner/requests/new" },
];

/** The agency's own nav, copied from `src/app/(admin)/layout.tsx` (admin role). */
const ADMIN_NAV: PaletteDestination[] = [
  { label: "Overview", href: "/admin", section: "Operations" },
  { label: "Clients", href: "/admin/clients", section: "Operations" },
  { label: "Tasks", href: "/admin/tasks", section: "Operations" },
  { label: "Leads", href: "/admin/leads", section: "Operations" },
  { label: "Partners", href: "/admin/partners", section: "Operations" },
  { label: "Projects", href: "/admin/projects", section: "Operations" },
  { label: "Messages", href: "/admin/messages", section: "Operations" },
  { label: "Threads", href: "/admin/helix", section: "Helix" },
  { label: "Approvals", href: "/admin/helix/approvals", section: "Helix" },
  { label: "Gadgets", href: "/admin/helix/gadgets", section: "Helix" },
  { label: "Activity", href: "/admin/helix/activity", section: "Helix" },
  { label: "Financials", href: "/admin/financials", section: "Finance" },
  { label: "Payments", href: "/admin/payments", section: "Finance" },
  { label: "Team", href: "/admin/team", section: "Manage" },
];

/** Everything a command could take you to, whatever its kind. */
function hrefsOf(commands: PaletteCommand[]): string[] {
  return commands.flatMap((command) =>
    command.action.kind === "navigate" ? [command.action.href] : []
  );
}

/** Search results the staff palette would fetch — every one an /admin route. */
const CRM_HITS = [
  { kind: "client", id: "c-1", label: "A client", detail: "Websites · Build" },
  { kind: "project", id: "p-1", label: "A project", detail: "Websites" },
];

/**
 * The two non-staff surfaces, exercised the same way. A query is included
 * because filtering is where a "safe" list has previously come back: the
 * needle is the one that matches every hardcoded entry the palette used to
 * carry ("s" hits Threads, Gadgets, Clients, Tasks, Projects, Messages).
 */
describe.each([
  ["a client", CLIENT_NAV],
  ["a partner", PARTNER_NAV],
])("%s pressing ⌘K", (_who, nav) => {
  const cases: [string, PaletteCommand[]][] = [
    ["unfiltered", buildPaletteCommands({ destinations: nav })],
    ["filtered", buildPaletteCommands({ destinations: nav, query: "s" })],
    [
      "with hits somehow present",
      buildPaletteCommands({ destinations: nav, hits: CRM_HITS }),
    ],
  ];

  it.each(cases)("is offered no /admin destination (%s)", (_label, commands) => {
    for (const href of hrefsOf(commands)) {
      expect(href.startsWith("/admin")).toBe(false);
    }
    expect(hrefsOf(commands).some((href) => href.includes("/admin"))).toBe(false);
  });

  it("is offered nothing but their own nav", () => {
    const commands = buildPaletteCommands({ destinations: nav });
    expect(hrefsOf(commands)).toEqual(nav.map((item) => item.href));
    expect(commands.every((command) => command.group === "Open")).toBe(true);
  });

  it("gets no Helix action, filtered or not", () => {
    for (const query of ["", "helix", "Ask", "approv", "queued"]) {
      const commands = buildPaletteCommands({ destinations: nav, query });
      expect(commands.some((command) => command.group === "Do")).toBe(false);
      expect(
        commands.some((command) => command.action.kind === "new-helix-thread")
      ).toBe(false);
    }
  });

  it("gets no CRM result, because the CRM is not theirs to search", () => {
    const commands = buildPaletteCommands({ destinations: nav, hits: CRM_HITS });
    for (const group of ["Clients", "Projects"]) {
      expect(commands.some((command) => command.group === group)).toBe(false);
    }
  });
});

/**
 * Staff keep everything, and the order is part of the contract: what you can
 * *do*, then what the search found, then where you can go.
 */
describe("staff pressing ⌘K", () => {
  it("keep the Helix actions", () => {
    const commands = buildPaletteCommands({
      destinations: ADMIN_NAV,
      staffCommands: true,
    });
    expect(commands.filter((command) => command.group === "Do")).toHaveLength(2);
    expect(
      commands.some((command) => command.action.kind === "new-helix-thread")
    ).toBe(true);
    expect(hrefsOf(commands)).toContain("/admin/helix/approvals");
  });

  it("keep the CRM hits, resolved onto the agency's own routes", () => {
    const commands = buildPaletteCommands({
      destinations: ADMIN_NAV,
      staffCommands: true,
      hits: CRM_HITS,
    });
    expect(hrefsOf(commands)).toContain("/admin/clients?client=c-1");
    expect(hrefsOf(commands)).toContain("/admin/projects/p-1");
  });

  it("see Do, then found, then Open", () => {
    const groups = buildPaletteCommands({
      destinations: ADMIN_NAV,
      staffCommands: true,
      hits: CRM_HITS,
    }).map((command) => command.group);
    expect(groups.indexOf("Do")).toBeLessThan(groups.indexOf("Clients"));
    expect(groups.indexOf("Clients")).toBeLessThan(groups.indexOf("Open"));
  });

  it("reach every nav row they were given", () => {
    const commands = buildPaletteCommands({
      destinations: ADMIN_NAV,
      staffCommands: true,
    });
    for (const item of ADMIN_NAV) {
      expect(hrefsOf(commands)).toContain(item.href);
    }
  });

  /* The nav is the gate, so a role that never receives a row never sees it —
     the VA nav, which `(admin)/layout.tsx` builds without Clients, Tasks,
     Leads, Partners or Finance. */
  it("do not gain rows their own nav withheld", () => {
    const vaNav = ADMIN_NAV.filter(
      (item) =>
        !["Clients", "Tasks", "Leads", "Partners", "Financials", "Payments", "Team"].includes(
          item.label
        )
    );
    const hrefs = hrefsOf(
      buildPaletteCommands({ destinations: vaNav, staffCommands: true })
    );
    expect(hrefs).not.toContain("/admin/clients");
    expect(hrefs).not.toContain("/admin/leads");
    expect(hrefs).not.toContain("/admin/financials");
  });
});

describe("the filter", () => {
  it("matches on the label", () => {
    const commands = buildPaletteCommands({
      destinations: CLIENT_NAV,
      query: "guid",
    });
    expect(hrefsOf(commands)).toEqual(["/guides"]);
  });

  it("matches on the section the row sits under", () => {
    const hrefs = hrefsOf(
      buildPaletteCommands({ destinations: CLIENT_NAV, query: "account" })
    );
    expect(hrefs).toEqual(["/notifications", "/settings"]);
  });

  it("returns nothing rather than everything when nothing matches", () => {
    expect(
      buildPaletteCommands({ destinations: CLIENT_NAV, query: "zzzz" })
    ).toEqual([]);
  });

  it("ignores case and surrounding space", () => {
    expect(
      hrefsOf(buildPaletteCommands({ destinations: CLIENT_NAV, query: "  TOOLS " }))
    ).toEqual(["/tools"]);
  });
});

describe("an empty nav", () => {
  it("offers nothing at all rather than falling back to a default list", () => {
    expect(buildPaletteCommands({ destinations: [] })).toEqual([]);
  });
});
