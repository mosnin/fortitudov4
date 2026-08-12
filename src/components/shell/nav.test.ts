/**
 * Which sidebar row reads as current.
 *
 * The rule arrived with `partner-shell.tsx` and outlived it: the partner nav is
 * `/partner` and `/partner/requests/new`, and a per-row prefix test lights both
 * at once on the second. The shell now decides once, longest match wins — so
 * these tests cover the case that motivated it AND the two existing surfaces,
 * because a nav rule that quietly changes which row is highlighted on `/admin`
 * is a regression nobody would think to look for.
 */

import { describe, expect, it } from "vitest";
import { activeHref, type ShellNavItem } from "./nav";

const PARTNER_NAV: ShellNavItem[] = [
  { label: "Requests", href: "/partner", icon: "ClipboardList" },
  { label: "New request", href: "/partner/requests/new", icon: "FilePlus2" },
];

const ADMIN_NAV: ShellNavItem[] = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard", exact: true },
  { label: "Clients", href: "/admin/clients", icon: "Users" },
  { label: "Projects", href: "/admin/projects", icon: "FolderKanban" },
  { label: "Threads", href: "/admin/helix", icon: "Sparkles", exact: true },
  { label: "Approvals", href: "/admin/helix/approvals", icon: "CheckCheck" },
  { label: "Gadgets", href: "/admin/helix/gadgets", icon: "Boxes" },
];

const CLIENT_NAV: ShellNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Projects", href: "/projects", icon: "FolderKanban" },
  { label: "Ask Helix", href: "/helix", icon: "Sparkles" },
];

describe("the partner nav", () => {
  it("keeps Requests current on a request's detail page", () => {
    expect(activeHref(PARTNER_NAV, "/partner/requests/abc")).toBe("/partner");
    expect(activeHref(PARTNER_NAV, "/partner")).toBe("/partner");
  });

  it("hands /partner/requests/new to the row that owns it, not to its parent", () => {
    expect(activeHref(PARTNER_NAV, "/partner/requests/new")).toBe(
      "/partner/requests/new"
    );
  });
});

describe("the admin nav", () => {
  it.each([
    ["/admin", "/admin"],
    ["/admin/clients", "/admin/clients"],
    ["/admin/clients/abc", "/admin/clients"],
    ["/admin/helix", "/admin/helix"],
    ["/admin/helix/approvals", "/admin/helix/approvals"],
    ["/admin/helix/gadgets", "/admin/helix/gadgets"],
    ["/admin/helix/gadgets/abc", "/admin/helix/gadgets"],
  ])("lights one row on %s", (pathname, expected) => {
    expect(activeHref(ADMIN_NAV, pathname)).toBe(expected);
  });

  it("lights nothing on a thread, because Threads is an exact row", () => {
    expect(activeHref(ADMIN_NAV, "/admin/helix/some-thread-id")).toBe(null);
  });

  it("does not let the exact Overview row swallow its children", () => {
    expect(activeHref(ADMIN_NAV, "/admin/projects")).toBe("/admin/projects");
  });
});

describe("the client nav", () => {
  it("matches a section and its children only", () => {
    expect(activeHref(CLIENT_NAV, "/projects")).toBe("/projects");
    expect(activeHref(CLIENT_NAV, "/projects/abc")).toBe("/projects");
    expect(activeHref(CLIENT_NAV, "/helix")).toBe("/helix");
  });

  it("does not match a route that merely starts with the same characters", () => {
    expect(activeHref(CLIENT_NAV, "/projects-archive")).toBe(null);
    expect(activeHref(CLIENT_NAV, "/dashboards")).toBe(null);
  });

  it("returns null off the nav entirely", () => {
    expect(activeHref(CLIENT_NAV, "/settings")).toBe(null);
    expect(activeHref([], "/dashboard")).toBe(null);
  });
});
