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
  canManagePartners,
  canManageProjects,
  canPartnerEditRequest,
  canPartnerSubmitRequest,
  canUpdateTask,
  canViewAllProjects,
  isAdmin,
  isPartner,
  isStaff,
  ROLE_LABELS,
} from "./permissions";
import {
  PARTNER_EDITABLE_REQUEST_FIELDS,
  PARTNER_PROTECTED_REQUEST_FIELDS,
  PARTNER_REQUEST_STATUSES,
} from "./partners";
import { userRoles, type UserRole } from "@/db/schema";

/** Everything a caller might arrive with that is not one of the five roles. */
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
  "Partner",
  "PARTNER",
  "partner ",
  " partner",
  "partners",
  "__proto__",
  "constructor",
  "toString",
  "undefined",
  "null",
];

describe("the role set", () => {
  it("is exactly the five roles AGENTS.md and plans/partners.md document", () => {
    expect([...userRoles]).toEqual([
      "client",
      "admin",
      "project_manager",
      "va",
      "partner",
    ]);
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

  it("refuses a partner", () => {
    // plans/partners.md: "It is not staff — isStaff() must keep returning false
    // for it, or a partner lands in /admin." A third party who brings work in
    // is not a member of the agency, and /admin is the agency's own console:
    // every client's fees, every lead's PII, the P&L.
    expect(isStaff("partner")).toBe(false);
  });

  it("admits exactly three roles, and adding one to the schema does not widen it", () => {
    expect(userRoles.filter((role) => isStaff(role)).sort()).toEqual([
      "admin",
      "project_manager",
      "va",
    ]);
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
  // src/app/post-login/page.tsx, in its exact order: staff → /admin, partner →
  // /partner, everyone else → /dashboard.
  const destination = (role: string) =>
    isStaff(role) ? "/admin" : isPartner(role) ? "/partner" : "/dashboard";

  it.each<[UserRole, string]>([
    ["admin", "/admin"],
    ["project_manager", "/admin"],
    ["va", "/admin"],
    ["client", "/dashboard"],
    ["partner", "/partner"],
  ])("sends %s to %s", (role, expected) => {
    expect(destination(role)).toBe(expected);
  });

  it("never sends an unrecognised role to the admin surface", () => {
    for (const role of NOT_A_ROLE) {
      expect(destination(role)).toBe("/dashboard");
    }
  });

  it("never sends a near-miss of 'partner' to the partner surface", () => {
    // A partner surface reached by a role string that merely looks like one is
    // a stranger reading somebody's requests and budgets.
    for (const role of NOT_A_ROLE) {
      expect(destination(role), role).not.toBe("/partner");
    }
  });

  it("routes exactly one role to /partner", () => {
    expect(userRoles.filter((role) => destination(role) === "/partner")).toEqual([
      "partner",
    ]);
  });

  it("does not leave a partner in the client portal", () => {
    // The default is /dashboard. A partner falling through to it lands in a
    // delivery-stage tracker for a project they do not own.
    expect(destination("partner")).not.toBe("/dashboard");
    expect(destination("partner")).not.toBe("/admin");
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

  it.each<UserRole>(["project_manager", "va", "client", "partner"])(
    "refuses %s",
    (role) => {
      expect(canManageAgency(role)).toBe(false);
    }
  );

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

  it("refuses a partner — they bring work in, they do not run delivery", () => {
    expect(canManageProjects("partner")).toBe(false);
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

  it("refuses a partner", () => {
    // A partner sees their own requests. Not our projects, not our clients.
    expect(canViewAllProjects("partner")).toBe(false);
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

  it.each<UserRole>(["va", "client", "partner"])("refuses %s", (role) => {
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

  it("refuses a partner every task, assigned to them or not", () => {
    // Our delivery tasks are not a partner's to touch, and an UNASSIGNED task
    // must not be claimable by one either — the null-assignee path is where a
    // sloppy ownership check leaks first.
    expect(canUpdateTask("partner", ME, { assigneeId: ME })).toBe(false);
    expect(canUpdateTask("partner", ME, { assigneeId: null })).toBe(false);
    expect(canUpdateTask("partner", ME, { assigneeId: SOMEONE_ELSE })).toBe(false);
    expect(canUpdateTask("partner", "", { assigneeId: null })).toBe(false);
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

describe("canManagePartners — the commercial side of a partner request", () => {
  it("admits admins and project managers only", () => {
    expect(userRoles.filter((role) => canManagePartners(role)).sort()).toEqual([
      "admin",
      "project_manager",
    ]);
  });

  it("refuses a VA — a partner request is a commercial document", () => {
    // plans/partners.md: a VA is scoped to the tasks they hold. Someone else's
    // budget and our quote against it are not in that scope.
    expect(canManagePartners("va")).toBe(false);
  });

  it("refuses a client", () => {
    expect(canManagePartners("client")).toBe(false);
  });

  it("refuses a partner — they do not administer partners, including themselves", () => {
    // The most dangerous confusion in this feature: "partner" reading as
    // "may manage partners" would hand every partner every other partner's
    // pipeline.
    expect(canManagePartners("partner")).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(canManagePartners(role)).toBe(false);
  });

  it("refuses a missing role", () => {
    expect(canManagePartners(undefined as unknown as string)).toBe(false);
    expect(canManagePartners(null as unknown as string)).toBe(false);
  });
});

describe("isPartner", () => {
  it("admits only the partner role", () => {
    expect(userRoles.filter((role) => isPartner(role))).toEqual(["partner"]);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(isPartner(role)).toBe(false);
  });

  it("refuses a missing role", () => {
    expect(isPartner(undefined as unknown as string)).toBe(false);
    expect(isPartner(null as unknown as string)).toBe(false);
  });
});

describe("canPartnerEditRequest", () => {
  const MINE = "11111111-0000-4000-8000-00000000aaaa";
  const THEIRS = "22222222-0000-4000-8000-00000000bbbb";

  const request = (
    overrides: Partial<{ partnerId: string; status: string }> = {}
  ) => ({ partnerId: MINE, status: "draft", ...overrides });

  it("lets a partner edit every editable field of their own draft", () => {
    for (const field of PARTNER_EDITABLE_REQUEST_FIELDS) {
      expect(canPartnerEditRequest("partner", MINE, request(), field), field).toBe(
        true
      );
    }
  });

  it("still lets them edit after submitting — we have not started quoting yet", () => {
    for (const field of PARTNER_EDITABLE_REQUEST_FIELDS) {
      expect(
        canPartnerEditRequest("partner", MINE, request({ status: "submitted" }), field),
        field
      ).toBe(true);
    }
  });

  it.each(["reviewing", "quoted", "accepted", "declined", "delivered"])(
    "freezes the request once it is %s",
    (status) => {
      // Once we are quoting against it, the thing being quoted stops moving.
      for (const field of PARTNER_EDITABLE_REQUEST_FIELDS) {
        expect(
          canPartnerEditRequest("partner", MINE, request({ status }), field),
          `${field} @ ${status}`
        ).toBe(false);
      }
    }
  );

  it("never allows a protected column, in ANY status", () => {
    // quotedCents is our price; projectId is our delivery link; status is the
    // pipeline. A partner editing quotedCents edits the number we invoice.
    for (const status of PARTNER_REQUEST_STATUSES) {
      for (const field of PARTNER_PROTECTED_REQUEST_FIELDS) {
        expect(
          canPartnerEditRequest("partner", MINE, request({ status }), field),
          `${field} @ ${status}`
        ).toBe(false);
      }
    }
  });

  it("keeps quotedCents out of the editable list entirely", () => {
    expect([...PARTNER_EDITABLE_REQUEST_FIELDS]).not.toContain("quotedCents");
    expect([...PARTNER_EDITABLE_REQUEST_FIELDS]).not.toContain("projectId");
    expect([...PARTNER_EDITABLE_REQUEST_FIELDS]).not.toContain("status");
  });

  it("refuses another partner's request, whatever the field or status", () => {
    // The failure that ends the relationship.
    for (const status of PARTNER_REQUEST_STATUSES) {
      for (const field of PARTNER_EDITABLE_REQUEST_FIELDS) {
        expect(
          canPartnerEditRequest("partner", MINE, request({ partnerId: THEIRS, status }), field),
          `${field} @ ${status}`
        ).toBe(false);
      }
    }
  });

  it("does not match two absent partner ids to each other", () => {
    expect(
      canPartnerEditRequest("partner", "", { partnerId: "", status: "draft" }, "title")
    ).toBe(false);
    expect(
      canPartnerEditRequest(
        "partner",
        null as unknown as string,
        { partnerId: null as unknown as string, status: "draft" },
        "title"
      )
    ).toBe(false);
  });

  it("compares partner ids exactly, not loosely", () => {
    expect(
      canPartnerEditRequest("partner", MINE, request({ partnerId: ` ${MINE}` }), "title")
    ).toBe(false);
    expect(
      canPartnerEditRequest(
        "partner",
        MINE,
        request({ partnerId: MINE.toUpperCase() }),
        "title"
      )
    ).toBe(false);
  });

  it("refuses an unknown status rather than treating it as editable", () => {
    for (const status of ["", "DRAFT", "draft ", "open", "__proto__"]) {
      expect(
        canPartnerEditRequest("partner", MINE, request({ status }), "title"),
        status
      ).toBe(false);
    }
  });

  it("refuses a field name inherited from Object.prototype", () => {
    for (const field of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
      expect(canPartnerEditRequest("partner", MINE, request(), field), field).toBe(
        false
      );
    }
  });

  it.each<UserRole>(["client", "va", "project_manager", "admin"])(
    "answers false for %s — this predicate is only the partner side",
    (role) => {
      // Staff manage requests through canManagePartners; nobody should read a
      // `true` here as staff authority, so it never returns one.
      expect(canPartnerEditRequest(role, MINE, request(), "title")).toBe(false);
    }
  );

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(canPartnerEditRequest(role, MINE, request(), "title")).toBe(false);
  });
});

describe("canPartnerSubmitRequest — the one transition a partner owns", () => {
  const MINE = "11111111-0000-4000-8000-00000000aaaa";
  const THEIRS = "22222222-0000-4000-8000-00000000bbbb";

  it("lets a partner submit their own draft", () => {
    expect(
      canPartnerSubmitRequest("partner", MINE, { partnerId: MINE, status: "draft" }, "submitted")
    ).toBe(true);
  });

  it.each(["reviewing", "quoted", "accepted", "declined", "delivered"])(
    "refuses moving their draft straight to %s",
    (next) => {
      expect(
        canPartnerSubmitRequest("partner", MINE, { partnerId: MINE, status: "draft" }, next)
      ).toBe(false);
    }
  );

  it("refuses re-opening a request that has left draft", () => {
    for (const status of ["submitted", "reviewing", "quoted", "accepted", "declined", "delivered"]) {
      expect(
        canPartnerSubmitRequest("partner", MINE, { partnerId: MINE, status }, "submitted"),
        status
      ).toBe(false);
      expect(
        canPartnerSubmitRequest("partner", MINE, { partnerId: MINE, status }, "draft"),
        status
      ).toBe(false);
    }
  });

  it("refuses another partner's draft", () => {
    expect(
      canPartnerSubmitRequest("partner", MINE, { partnerId: THEIRS, status: "draft" }, "submitted")
    ).toBe(false);
  });

  it.each(NOT_A_ROLE)("refuses %o", (role) => {
    expect(
      canPartnerSubmitRequest(role, MINE, { partnerId: MINE, status: "draft" }, "submitted")
    ).toBe(false);
  });

  it.each<UserRole>(["client", "va", "project_manager", "admin"])(
    "answers false for %s — staff move status through canManagePartners",
    (role) => {
      expect(
        canPartnerSubmitRequest(role, MINE, { partnerId: MINE, status: "draft" }, "submitted")
      ).toBe(false);
    }
  );
});

describe("the full matrix", () => {
  const CAPABILITIES = {
    isStaff,
    isAdmin,
    canManageAgency,
    canManageProjects,
    canViewAllProjects,
    canManageLeads,
    canManagePartners,
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
    for (const name of [
      "isStaff",
      "canManageProjects",
      "canViewAllProjects",
      "canManageLeads",
      "canManagePartners",
    ] as const) {
      expect(CAPABILITIES[name]("project_manager"), name).toBe(true);
    }
  });

  it("grants a partner nothing at all", () => {
    // A partner holds exactly one thing: their own requests, checked row by
    // row against partnerId. None of the role-level capabilities is theirs,
    // and isStaff least of all.
    for (const [name, allows] of Object.entries(CAPABILITIES)) {
      expect(allows("partner"), `partner should not pass ${name}`).toBe(false);
    }
  });

  it("gives a partner strictly no more than a client", () => {
    for (const [name, allows] of Object.entries(CAPABILITIES)) {
      expect(allows("partner"), name).toBe(allows("client"));
    }
  });
});
