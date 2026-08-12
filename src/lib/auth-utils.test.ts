/**
 * Project scoping and the route-level guards.
 *
 * `permissions.ts` answers "may this role, in principle"; this module answers
 * "may this user, on this row" — and it is where the two rules AGENTS.md
 * states about data reach live: a VA only sees projects they hold a task on,
 * and a client only ever sees their own. Both are failures that look like
 * success when they break: nothing throws, the page just renders somebody
 * else's project.
 *
 * Database-free. `@/db` is replaced with a small fake query builder that
 * records which table each call went to and returns rows the test staged, so
 * the assertions are about which branch ran and what it concluded — not about
 * drizzle's SQL. The `where(...)` predicate itself is drizzle's business and
 * is deliberately not asserted on; what is asserted is that the client and VA
 * branches query at all, and that the "sees everything" branch does not.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { projects, tasks, users, type UserRole } from "@/db/schema";

const fake = vi.hoisted(() => ({
  /** Rows the next query against a given table should return. */
  rows: new Map<unknown, unknown[]>(),
  /** Every query the code under test issued, in order. */
  calls: [] as { kind: "select" | "selectDistinct"; table: unknown; limit?: number }[],
  /** Who Clerk says is signed in. */
  clerkId: null as string | null,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: fake.clerkId }),
}));

vi.mock("@/db", () => {
  function builder(kind: "select" | "selectDistinct") {
    const call: { kind: "select" | "selectDistinct"; table: unknown; limit?: number } = {
      kind,
      table: null,
    };
    const chain = {
      from(table: unknown) {
        call.table = table;
        return chain;
      },
      where() {
        return chain;
      },
      limit(n: number) {
        call.limit = n;
        return chain;
      },
      then(
        onFulfilled?: (value: unknown[]) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) {
        fake.calls.push(call);
        return Promise.resolve(fake.rows.get(call.table) ?? []).then(
          onFulfilled,
          onRejected
        );
      },
    };
    return chain;
  }

  return {
    db: {
      select: () => builder("select"),
      selectDistinct: () => builder("selectDistinct"),
    },
  };
});

const {
  getAccessibleProjectIds,
  verifyProjectAccess,
  vaHasProjectAssignment,
  requireAdmin,
  requireStaff,
  getAuthenticatedUser,
} = await import("./auth-utils");

const VA = "aaaaaaaa-0000-4000-8000-000000000001";
const CLIENT = "bbbbbbbb-0000-4000-8000-000000000002";
const PROJECT = "cccccccc-0000-4000-8000-000000000003";

/** Stage the `users` lookup `getAuthenticatedUser` performs. */
function signedInAs(role: UserRole | string, id = CLIENT) {
  fake.clerkId = `clerk_${id}`;
  fake.rows.set(users, [{ id, role, clerkId: `clerk_${id}` }]);
}

/** Read the status off the NextResponse these helpers throw on refusal. */
async function statusOfRejection(promise: Promise<unknown>): Promise<number> {
  try {
    await promise;
  } catch (thrown) {
    expect(thrown).toBeInstanceOf(Response);
    return (thrown as Response).status;
  }
  throw new Error("expected the call to be refused, but it resolved");
}

beforeEach(() => {
  fake.rows.clear();
  fake.calls.length = 0;
  fake.clerkId = null;
});

describe("getAccessibleProjectIds", () => {
  it.each<UserRole>(["admin", "project_manager"])(
    "returns 'all' for %s without querying anything",
    async (role) => {
      await expect(getAccessibleProjectIds(CLIENT, role)).resolves.toBe("all");
      expect(fake.calls).toHaveLength(0);
    }
  );

  it("scopes a VA to the projects they hold a task on", async () => {
    fake.rows.set(tasks, [{ projectId: "p-1" }, { projectId: "p-2" }]);

    await expect(getAccessibleProjectIds(VA, "va")).resolves.toEqual(["p-1", "p-2"]);
    expect(fake.calls.map((c) => c.table)).toEqual([tasks]);
  });

  it("gives a VA with no assignments an empty list, never 'all'", async () => {
    // The difference between [] and "all" is the entire scoping rule; a caller
    // that treats an empty result as "unfiltered" would leak every project.
    const result = await getAccessibleProjectIds(VA, "va");

    expect(result).toEqual([]);
    expect(result).not.toBe("all");
  });

  it("reads a VA's scope from tasks, not from project ownership", async () => {
    fake.rows.set(tasks, [{ projectId: "p-1" }]);
    fake.rows.set(projects, [{ id: "p-owned-by-them" }]);

    await expect(getAccessibleProjectIds(VA, "va")).resolves.toEqual(["p-1"]);
  });

  it("scopes a client to the projects they own", async () => {
    fake.rows.set(projects, [{ id: PROJECT }]);

    await expect(getAccessibleProjectIds(CLIENT, "client")).resolves.toEqual([PROJECT]);
    expect(fake.calls.map((c) => c.table)).toEqual([projects]);
  });

  it("gives a client with no projects an empty list", async () => {
    await expect(getAccessibleProjectIds(CLIENT, "client")).resolves.toEqual([]);
  });

  it("gives a partner nothing, without querying anything", async () => {
    // A partner has no projects. Left to the fall-through they would get the
    // CLIENT rule — every project whose userId is theirs — which is the wrong
    // rule rather than a harmlessly narrow one: a client account later
    // switched to `partner` keeps everything it owned.
    fake.rows.set(projects, [{ id: PROJECT }]);

    const result = await getAccessibleProjectIds(CLIENT, "partner");

    expect(result).toEqual([]);
    expect(result).not.toBe("all");
    expect(fake.calls).toHaveLength(0);
  });

  it.each(["", "owner", "Admin", "superadmin"])(
    "treats the unrecognised role %o as least-privileged, not as staff",
    async (role) => {
      fake.rows.set(projects, [{ id: PROJECT }]);

      const result = await getAccessibleProjectIds(CLIENT, role);

      expect(result).not.toBe("all");
      expect(result).toEqual([PROJECT]);
    }
  );
});

describe("vaHasProjectAssignment", () => {
  it("is true when a task on the project names them", async () => {
    fake.rows.set(tasks, [{ id: "t-1" }]);

    await expect(vaHasProjectAssignment(PROJECT, VA)).resolves.toBe(true);
  });

  it("is false when no task does", async () => {
    await expect(vaHasProjectAssignment(PROJECT, VA)).resolves.toBe(false);
  });

  it("asks the database for one row, not for the whole task list", async () => {
    await vaHasProjectAssignment(PROJECT, VA);

    expect(fake.calls).toEqual([{ kind: "select", table: tasks, limit: 1 }]);
  });
});

describe("verifyProjectAccess", () => {
  const project = { id: PROJECT, userId: CLIENT, name: "Clinic site" };

  it("404s on a project that does not exist, whoever is asking", async () => {
    // Checked before the role, so a missing id cannot be probed for existence
    // by role — every caller gets the same answer.
    for (const role of ["admin", "project_manager", "va", "client"]) {
      fake.calls.length = 0;
      expect(await statusOfRejection(verifyProjectAccess(PROJECT, CLIENT, role))).toBe(404);
    }
  });

  it.each<UserRole>(["admin", "project_manager"])(
    "lets %s open a project they do not own",
    async (role) => {
      fake.rows.set(projects, [project]);

      await expect(
        verifyProjectAccess(PROJECT, "somebody-else", role)
      ).resolves.toEqual(project);
    }
  );

  it("lets a VA open a project they hold a task on", async () => {
    fake.rows.set(projects, [project]);
    fake.rows.set(tasks, [{ id: "t-1" }]);

    await expect(verifyProjectAccess(PROJECT, VA, "va")).resolves.toEqual(project);
  });

  it("refuses a VA a project they hold no task on", async () => {
    fake.rows.set(projects, [project]);
    fake.rows.set(tasks, []);

    expect(await statusOfRejection(verifyProjectAccess(PROJECT, VA, "va"))).toBe(403);
  });

  it("refuses a VA even when the project belongs to them as a user", async () => {
    // A VA's own client row is irrelevant: the scope is the task assignment.
    fake.rows.set(projects, [{ ...project, userId: VA }]);
    fake.rows.set(tasks, []);

    expect(await statusOfRejection(verifyProjectAccess(PROJECT, VA, "va"))).toBe(403);
  });

  it("lets a client open their own project", async () => {
    fake.rows.set(projects, [project]);

    await expect(verifyProjectAccess(PROJECT, CLIENT, "client")).resolves.toEqual(project);
  });

  it("refuses a client somebody else's project", async () => {
    fake.rows.set(projects, [{ ...project, userId: "another-client" }]);

    expect(await statusOfRejection(verifyProjectAccess(PROJECT, CLIENT, "client"))).toBe(403);
  });

  it("refuses a project whose owner is null to a client", async () => {
    fake.rows.set(projects, [{ ...project, userId: null }]);

    expect(await statusOfRejection(verifyProjectAccess(PROJECT, CLIENT, "client"))).toBe(403);
  });

  it("refuses a partner a project, including one whose userId is theirs", async () => {
    const PARTNER_USER = "dddddddd-0000-4000-8000-000000000004";
    fake.rows.set(projects, [{ ...project, userId: PARTNER_USER }]);
    fake.rows.set(tasks, [{ id: "t-1" }]);

    expect(
      await statusOfRejection(verifyProjectAccess(PROJECT, PARTNER_USER, "partner"))
    ).toBe(403);
  });

  it("refuses a partner a project they hold a task on", async () => {
    // Neither the client rule nor the VA rule applies to a partner.
    fake.rows.set(projects, [project]);
    fake.rows.set(tasks, [{ id: "t-1" }]);

    expect(await statusOfRejection(verifyProjectAccess(PROJECT, VA, "partner"))).toBe(403);
  });

  it.each(["", "owner", "Admin", "va "])(
    "refuses the unrecognised role %o somebody else's project",
    async (role) => {
      fake.rows.set(projects, [{ ...project, userId: "another-client" }]);

      expect(await statusOfRejection(verifyProjectAccess(PROJECT, CLIENT, role))).toBe(403);
    }
  );
});

describe("getAuthenticatedUser", () => {
  it("401s when nobody is signed in", async () => {
    expect(await statusOfRejection(getAuthenticatedUser())).toBe(401);
  });

  it("404s when the Clerk session has no database row yet", async () => {
    fake.clerkId = "clerk_brand_new";

    expect(await statusOfRejection(getAuthenticatedUser())).toBe(404);
  });

  it("returns the database row, which is where the role comes from", async () => {
    signedInAs("project_manager");

    await expect(getAuthenticatedUser()).resolves.toMatchObject({
      role: "project_manager",
    });
  });
});

describe("requireStaff", () => {
  it.each<UserRole>(["admin", "project_manager", "va"])("admits %s", async (role) => {
    signedInAs(role);

    await expect(requireStaff()).resolves.toMatchObject({ role });
  });

  it("refuses a client with 403", async () => {
    signedInAs("client");

    expect(await statusOfRejection(requireStaff())).toBe(403);
  });

  it("refuses a partner with 403 — every staff API hangs off this", async () => {
    signedInAs("partner");

    expect(await statusOfRejection(requireStaff())).toBe(403);
  });

  it("refuses an anonymous caller with 401 before looking at any role", async () => {
    expect(await statusOfRejection(requireStaff())).toBe(401);
  });

  it.each(["", "owner", "Admin"])("refuses the unrecognised role %o", async (role) => {
    signedInAs(role);

    expect(await statusOfRejection(requireStaff())).toBe(403);
  });
});

describe("requireAdmin — the guard on finance", () => {
  it("admits an admin", async () => {
    signedInAs("admin");

    await expect(requireAdmin()).resolves.toMatchObject({ role: "admin" });
  });

  it.each<UserRole>(["project_manager", "va", "client", "partner"])(
    "refuses %s with 403",
    async (role) => {
      signedInAs(role);

      expect(await statusOfRejection(requireAdmin())).toBe(403);
    }
  );

  it("refuses an anonymous caller", async () => {
    expect(await statusOfRejection(requireAdmin())).toBe(401);
  });

  it.each(["Admin", "ADMIN", "admin ", "superadmin", "__proto__"])(
    "refuses the near-miss role %o",
    async (role) => {
      signedInAs(role);

      expect(await statusOfRejection(requireAdmin())).toBe(403);
    }
  );
});
