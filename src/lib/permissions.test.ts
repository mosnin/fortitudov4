/**
 * The access model.
 *
 * These predicates are the whole of the role check: every admin page, every
 * API route and the post-login router call into them and trust the answer.
 * Access control that silently loosens is the worst kind of regression —
 * nothing fails, nothing logs, and a VA quietly gains the agency's P&L — so
 * the deny cases here are enumerated at least as carefully as the allows, and
 * the matrix is driven off `userRoles` so a role added to the schema without a
 * decision here fails a test rather than defaulting to something.
 */

import { describe, expect, it } from "vitest";
import {
  canManageAgency,
  canManageLeads,
  canManageProjects,
  canUpdateTask,
  canViewAllProjects,
  isAdmin,
  isStaff,
  ROLE_LABELS,
} from "./permissions";
import { userRoles, type UserRole } from "@/db/schema";

/** Everything a caller might arrive with that is not one of the four roles. */
const NOT_A_ROLE = [
  "",
  " ",
  "Admin",
  "ADMIN",
  "admin ",
  " admin",
  "superadmin",
  "owner",
  "staff",
  "guest",
  "project_manager;admin",
  "__proto__",
  "constructor",
  "toString",
  "undefined",
  "null",
];

describe("the role set", () => {
  it("is exactly the four roles AGENTS.md documents", () => {
    expect([...userRoles]).toEqual(["client", "admin", "project_manager", "va"]);
  });

  it("labels every role and no role that does not exist", () => {
    expect(Object.keys(ROLE_LABELS).sort()).toEqual([...userRoles].sort());
  });
});

describe("isStaff", () => {
  it.each<UserRole>(["admin", "project_manager", "va"])("admits %s", (role) => {
    expect(isStaff(role)).toBe(true);
  });

  it("refuses a client", () => {
    // The whole (admin) route group hangs off this one answer.
    expect(isStaff("client")).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(isStaff(role)).toBe(false);
  });

  it("refuses a missing role", () => {
    expect(isStaff(undefined as unknown as string)).toBe(false);
    expect(isStaff(null as unknown as string)).toBe(false);
  });
});

describe("post-login routing", () => {
  // src/app/post-login/page.tsx: staff → /admin, everyone else → /dashboard.
  const destination = (role: string) => (isStaff(role) ? "/admin" : "/dashboard");

  it.each<[UserRole, string]>([
    ["admin", "/admin"],
    ["project_manager", "/admin"],
    ["va", "/admin"],
    ["client", "/dashboard"],
  ])("sends %s to %s", (role, expected) => {
    expect(destination(role)).toBe(expected);
  });

  it("never sends an unrecognised role to the admin surface", () => {
    for (const role of NOT_A_ROLE) {
      expect(destination(role)).toBe("/dashboard");
    }
  });
});

describe("isAdmin", () => {
  it("admits only the admin role", () => {
    const admitted = userRoles.filter((role) => isAdmin(role));
    expect(admitted).toEqual(["admin"]);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(isAdmin(role)).toBe(false);
  });
});

describe("canManageAgency — billing, team roles, integration secrets", () => {
  it("is admin-only", () => {
    // AGENTS.md: finance pages require admin. A project manager runs delivery,
    // not the agency's money.
    expect(userRoles.filter((role) => canManageAgency(role))).toEqual(["admin"]);
  });

  it.each<UserRole>(["project_manager", "va", "client"])("refuses %s", (role) => {
    expect(canManageAgency(role)).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(canManageAgency(role)).toBe(false);
  });
});

describe("canManageProjects", () => {
  it("admits admins and project managers only", () => {
    expect(userRoles.filter((role) => canManageProjects(role)).sort()).toEqual([
      "admin",
      "project_manager",
    ]);
  });

  it("refuses a VA — they update their own tasks, they do not reassign work", () => {
    expect(canManageProjects("va")).toBe(false);
  });

  it("refuses a client", () => {
    expect(canManageProjects("client")).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(canManageProjects(role)).toBe(false);
  });
});

describe("canViewAllProjects", () => {
  it("admits admins and project managers only", () => {
    expect(userRoles.filter((role) => canViewAllProjects(role)).sort()).toEqual([
      "admin",
      "project_manager",
    ]);
  });

  it("refuses a VA, who is scoped to the projects they hold a task on", () => {
    // If this ever returns true, getAccessibleProjectIds returns "all" and the
    // VA scoping in auth-utils stops running at all.
    expect(canViewAllProjects("va")).toBe(false);
  });

  it("refuses a client", () => {
    expect(canViewAllProjects("client")).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(canViewAllProjects(role)).toBe(false);
  });
});

describe("canManageLeads — reading lead PII", () => {
  it("admits admins and project managers only", () => {
    expect(userRoles.filter((role) => canManageLeads(role)).sort()).toEqual([
      "admin",
      "project_manager",
    ]);
  });

  it.each<UserRole>(["va", "client"])("refuses %s", (role) => {
    expect(canManageLeads(role)).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(canManageLeads(role)).toBe(false);
  });
});

describe("canUpdateTask", () => {
  const ME = "a1b2c3d4-1111-4111-8111-111111111111";
  const SOMEONE_ELSE = "f9e8d7c6-2222-4222-8222-222222222222";

  it("lets an admin update anyone's task", () => {
    expect(canUpdateTask("admin", ME, { assigneeId: SOMEONE_ELSE })).toBe(true);
    expect(canUpdateTask("admin", ME, { assigneeId: null })).toBe(true);
  });

  it("lets a project manager update anyone's task", () => {
    expect(canUpdateTask("project_manager", ME, { assigneeId: SOMEONE_ELSE })).toBe(true);
    expect(canUpdateTask("project_manager", ME, { assigneeId: null })).toBe(true);
  });

  it("lets a VA update a task assigned to them", () => {
    expect(canUpdateTask("va", ME, { assigneeId: ME })).toBe(true);
  });

  it("refuses a VA another VA's task", () => {
    expect(canUpdateTask("va", ME, { assigneeId: SOMEONE_ELSE })).toBe(false);
  });

  it("refuses a VA an unassigned task", () => {
    // Checklists seed unassigned; claiming one is a project-manager action.
    expect(canUpdateTask("va", ME, { assigneeId: null })).toBe(false);
  });

  it("refuses a client even when the task names them", () => {
    expect(canUpdateTask("client", ME, { assigneeId: ME })).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o even when the task names them", (role) => {
    expect(canUpdateTask(role, ME, { assigneeId: ME })).toBe(false);
  });

  it("does not treat a null assignee as matching a missing user id", () => {
    // `task.assigneeId === userId` alone is null === null when a caller
    // arrives without an id, which passed a VA with no user id on any
    // UNASSIGNED task. Never reachable — users.id is a non-null uuid and every
    // caller passes a row from the database — but an ownership check that two
    // absent values can satisfy is the wrong shape to leave in this function.
    expect(canUpdateTask("va", null as unknown as string, { assigneeId: null })).toBe(
      false
    );
    expect(canUpdateTask("va", undefined as unknown as string, { assigneeId: null })).toBe(
      false
    );
    expect(canUpdateTask("va", "", { assigneeId: "" })).toBe(false);
  });

  it("compares ids exactly, not loosely", () => {
    expect(canUpdateTask("va", ME, { assigneeId: ` ${ME}` })).toBe(false);
    expect(canUpdateTask("va", ME, { assigneeId: ME.toUpperCase() })).toBe(false);
  });
});

describe("the full matrix", () => {
  const CAPABILITIES = {
    isStaff,
    isAdmin,
    canManageAgency,
    canManageProjects,
    canViewAllProjects,
    canManageLeads,
  } as const;

  it("grants a client nothing at all", () => {
    for (const [name, allows] of Object.entries(CAPABILITIES)) {
      expect(allows("client"), `client should not pass ${name}`).toBe(false);
    }
  });

  it("grants an admin everything", () => {
    for (const [name, allows] of Object.entries(CAPABILITIES)) {
      expect(allows("admin"), `admin should pass ${name}`).toBe(true);
    }
  });

  it("grants a VA nothing beyond staff membership", () => {
    for (const [name, allows] of Object.entries(CAPABILITIES)) {
      if (name === "isStaff") continue;
      expect(allows("va"), `va should not pass ${name}`).toBe(false);
    }
  });

  it("grants a project manager everything except the agency's own controls", () => {
    expect(canManageAgency("project_manager")).toBe(false);
    expect(isAdmin("project_manager")).toBe(false);
    for (const name of ["isStaff", "canManageProjects", "canViewAllProjects", "canManageLeads"] as const) {
      expect(CAPABILITIES[name]("project_manager"), name).toBe(true);
    }
  });
});
