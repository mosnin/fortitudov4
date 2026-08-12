/**
 * The partner roster write layer — POST /api/partners and
 * PATCH /api/partners/[id].
 *
 * A partner organisation is ours to create and ours to describe. Two fields
 * make that more than bookkeeping: `status` is a statement about the
 * relationship, and `userId` decides which login the entire /partner surface
 * scopes to — set it wrongly and one partner's queue opens for someone else.
 * Neither is self-service, so the tests below spend most of their time on who
 * is refused.
 *
 * Database-free, in the style of api/leads/route.test.ts: `@/db` is a fake that
 * records what reached the insert/update, and Clerk is stubbed to a user id.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { partners, users, type UserRole } from "@/db/schema";
import { PARTNER_KINDS, PARTNER_STATUSES } from "@/lib/partners";

const fake = vi.hoisted(() => ({
  rows: new Map<unknown, unknown[]>(),
  /**
   * Per-table result sets consumed in order, for the two routes that query one
   * table twice — `users`, first for the caller and then to check the portal
   * account being linked exists. Falls back to `rows` once exhausted.
   */
  sequences: new Map<unknown, unknown[][]>(),
  writes: [] as {
    kind: "insert" | "update";
    table: unknown;
    row: Record<string, unknown>;
  }[],
  updateReturns: null as unknown[] | null,
  clerkId: null as string | null,
  failWith: null as Error | null,
  failWrites: null as Error | null,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: fake.clerkId }),
}));

vi.mock("@/db", () => {
  function select() {
    let table: unknown = null;
    const chain = {
      from(t: unknown) {
        table = t;
        return chain;
      },
      where: () => chain,
      limit: () => chain,
      then(
        onFulfilled?: (value: unknown[]) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) {
        if (fake.failWith) return Promise.reject(fake.failWith).then(onFulfilled, onRejected);
        const queued = fake.sequences.get(table);
        const result = queued?.length
          ? (queued.shift() as unknown[])
          : fake.rows.get(table) ?? [];
        return Promise.resolve(result).then(onFulfilled, onRejected);
      },
    };
    return chain;
  }

  return {
    db: {
      select,
      selectDistinct: select,
      insert(table: unknown) {
        return {
          values(row: Record<string, unknown>) {
            return {
              async returning() {
                if (fake.failWith || fake.failWrites) {
                  throw fake.failWith ?? fake.failWrites;
                }
                fake.writes.push({ kind: "insert", table, row });
                return [{ id: "created-id", ...row }];
              },
            };
          },
        };
      },
      update(table: unknown) {
        return {
          set(row: Record<string, unknown>) {
            const chain = {
              where: () => chain,
              async returning() {
                if (fake.failWith || fake.failWrites) {
                  throw fake.failWith ?? fake.failWrites;
                }
                fake.writes.push({ kind: "update", table, row });
                return fake.updateReturns ?? [{ id: "updated-id", ...row }];
              },
            };
            return chain;
          },
        };
      },
    },
  };
});

const { POST } = await import("./route");
const { PATCH } = await import("./[id]/route");

const STAFF_USER = "11111111-0000-4000-8000-000000000002";
const PARTNER_USER = "11111111-0000-4000-8000-000000000001";
const PARTNER_ID = "22222222-0000-4000-8000-000000000001";
const PORTAL_USER = "11111111-0000-4000-8000-000000000009";

function post(body: unknown, raw?: string): Promise<Response> {
  return POST(
    new Request("https://fortitudo.agency/api/partners", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw ?? JSON.stringify(body),
    })
  );
}

function patch(body: unknown, { id = PARTNER_ID, raw }: { id?: string; raw?: string } = {}) {
  return PATCH(
    new Request(`https://fortitudo.agency/api/partners/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: raw ?? JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );
}

function signedInAs(role: UserRole | string, id = STAFF_USER) {
  fake.clerkId = `clerk_${id}`;
  fake.rows.set(users, [{ id, role, clerkId: `clerk_${id}`, email: "a@b.com" }]);
}

const VALID = {
  companyName: "Northline Studio",
  contactName: "Dana Okoro",
  email: "dana@northline.studio",
  kind: "agency",
};

beforeEach(() => {
  fake.rows.clear();
  fake.sequences.clear();
  fake.writes.length = 0;
  fake.updateReturns = null;
  fake.clerkId = null;
  fake.failWith = null;
  fake.failWrites = null;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("callers with no business here", () => {
  it("refuses an unauthenticated POST with 401 and writes nothing", async () => {
    const response = await post(VALID);

    expect(response.status).toBe(401);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses an unauthenticated PATCH with 401 and writes nothing", async () => {
    const response = await patch({ companyName: "Renamed" });

    expect(response.status).toBe(401);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses a signed-in session with no database row", async () => {
    fake.clerkId = "clerk_brand_new";

    expect((await post(VALID)).status).toBe(404);
    expect(fake.writes).toHaveLength(0);
  });

  it.each<UserRole>(["va", "client", "partner"])(
    "refuses %s on POST with 403",
    async (role) => {
      signedInAs(role);

      const response = await post(VALID);

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it.each<UserRole>(["va", "client", "partner"])(
    "refuses %s on PATCH with 403",
    async (role) => {
      signedInAs(role);

      const response = await patch({ companyName: "Renamed" });

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it("refuses a partner editing their own record", async () => {
    // Including the fields that look harmless: the roster is the commercial
    // relationship, and `userId` decides whose queue /partner opens.
    signedInAs("partner", PARTNER_USER);
    fake.rows.set(partners, [{ id: PARTNER_ID, status: "active", userId: PARTNER_USER }]);

    for (const body of [
      { contactName: "Someone Else" },
      { status: "active" },
      { userId: PARTNER_USER },
    ]) {
      expect((await patch(body)).status).toBe(403);
    }
    expect(fake.writes).toHaveLength(0);
  });

  it.each(["", "owner", "Admin", "admin ", "__proto__"])(
    "refuses the unrecognised role %o",
    async (role) => {
      signedInAs(role);

      expect((await post(VALID)).status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );
});

describe("creating a partner", () => {
  beforeEach(() => signedInAs("admin"));

  it("writes the row and answers 201", async () => {
    const response = await post(VALID);

    expect(response.status).toBe(201);
    expect(fake.writes).toHaveLength(1);
    expect(fake.writes[0].table).toBe(partners);
    expect(fake.writes[0].row).toEqual({
      companyName: "Northline Studio",
      contactName: "Dana Okoro",
      email: "dana@northline.studio",
      kind: "agency",
      userId: null,
      notes: null,
      createdBy: STAFF_USER,
    });
  });

  it("returns the created row", async () => {
    const payload = await (await post(VALID)).json();

    expect(payload.companyName).toBe("Northline Studio");
  });

  it("lets a project_manager create one too", async () => {
    signedInAs("project_manager");

    expect((await post(VALID)).status).toBe(201);
  });

  it("records the caller as createdBy, whatever the body claims", async () => {
    await post({ ...VALID, createdBy: PARTNER_USER, id: PARTNER_ID });

    expect(fake.writes[0].row.createdBy).toBe(STAFF_USER);
    expect(fake.writes[0].row).not.toHaveProperty("id");
  });

  it.each(PARTNER_KINDS)("accepts kind %s", async (kind) => {
    expect((await post({ ...VALID, kind })).status).toBe(201);
  });

  it.each(PARTNER_STATUSES)("accepts status %s", async (status) => {
    const response = await post({ ...VALID, status });

    expect(response.status).toBe(201);
    expect(fake.writes.at(-1)?.row.status).toBe(status);
  });

  it("refuses a kind outside the two labels", async () => {
    // `kind` is a label, not a behaviour — but it is still a closed set.
    const response = await post({ ...VALID, kind: "reseller" });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it.each([
    ["companyName missing", { contactName: "Dana" }],
    ["contactName missing", { companyName: "Northline" }],
    ["companyName empty", { ...VALID, companyName: "" }],
    ["companyName only whitespace", { ...VALID, companyName: "   " }],
    ["companyName over 255", { ...VALID, companyName: "x".repeat(256) }],
    ["contactName over 255", { ...VALID, contactName: "x".repeat(256) }],
    ["email not an email", { ...VALID, email: "dana@" }],
    ["notes over 2000", { ...VALID, notes: "x".repeat(2001) }],
    ["userId not a uuid", { ...VALID, userId: "3" }],
    ["status not a status", { ...VALID, status: "vip" }],
  ])("refuses %s with 400 and writes nothing", async (_label, body) => {
    const response = await post(body);

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("trims before capping", async () => {
    await post({ ...VALID, companyName: `  ${"x".repeat(255)}  ` });

    expect(fake.writes[0].row.companyName).toBe("x".repeat(255));
  });

  it("drops unknown fields instead of writing them", async () => {
    const response = await post({
      ...VALID,
      commissionPct: 50,
      revenueSplit: "50/50",
      tier: "Diamond",
    });

    expect(response.status).toBe(201);
    expect(fake.writes[0].row).not.toHaveProperty("commissionPct");
    expect(fake.writes[0].row).not.toHaveProperty("revenueSplit");
    expect(fake.writes[0].row).not.toHaveProperty("tier");
  });

  it("links a portal account that exists", async () => {
    // First users lookup: the caller. Second: the account being linked.
    fake.sequences.set(users, [
      [{ id: STAFF_USER, role: "admin", clerkId: `clerk_${STAFF_USER}` }],
      [{ id: PORTAL_USER }],
    ]);

    const response = await post({ ...VALID, userId: PORTAL_USER });

    expect(response.status).toBe(201);
    expect(fake.writes[0].row.userId).toBe(PORTAL_USER);
  });

  it("refuses a portal account that does not exist, rather than failing the FK", async () => {
    // A stale id in a form should be a sentence, not a foreign-key 500.
    fake.sequences.set(users, [
      [{ id: STAFF_USER, role: "admin", clerkId: `clerk_${STAFF_USER}` }],
      [],
    ]);

    const response = await post({ ...VALID, userId: PORTAL_USER });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("makes the same check on update", async () => {
    fake.sequences.set(users, [
      [{ id: STAFF_USER, role: "admin", clerkId: `clerk_${STAFF_USER}` }],
      [],
    ]);

    const response = await patch({ userId: PORTAL_USER });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });
});

describe("updating a partner", () => {
  beforeEach(() => signedInAs("admin"));

  it("writes only what the body carried, plus updatedAt", async () => {
    const response = await patch({ status: "paused" });

    expect(response.status).toBe(200);
    expect(Object.keys(fake.writes[0].row).sort()).toEqual(["status", "updatedAt"]);
    expect(fake.writes[0].row.status).toBe("paused");
  });

  it("returns the updated row", async () => {
    const payload = await (await patch({ companyName: "Renamed" })).json();

    expect(payload.companyName).toBe("Renamed");
  });

  it("clears a nullable field when the body sends null", async () => {
    await patch({ notes: null });

    expect(fake.writes[0].row.notes).toBeNull();
  });

  it("unlinks a portal account when userId is null", async () => {
    // Deleting a login must be able to unlink the person without deleting the
    // relationship or the requests hanging off it.
    await patch({ userId: null });

    expect(fake.writes[0].row.userId).toBeNull();
  });

  it("404s on a partner id that does not exist", async () => {
    fake.updateReturns = [];

    expect((await patch({ status: "archived" })).status).toBe(404);
  });

  it("400s on an id that is not a uuid, before touching the database", async () => {
    const response = await patch({ status: "archived" }, { id: "12" });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses a PATCH that changes nothing", async () => {
    const response = await patch({});

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses a body of nothing but unknown fields rather than writing them", async () => {
    const response = await patch({ commissionPct: 50, createdBy: PARTNER_USER });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("drops unknown fields alongside a legitimate one", async () => {
    const response = await patch({ companyName: "Renamed", commissionPct: 50 });

    expect(response.status).toBe(200);
    expect(fake.writes[0].row).not.toHaveProperty("commissionPct");
    expect(fake.writes[0].row).not.toHaveProperty("createdBy");
  });

  it("refuses an invalid status rather than storing it", async () => {
    const response = await patch({ status: "vip" });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });
});

describe("malformed bodies", () => {
  beforeEach(() => signedInAs("admin"));

  it.each([
    ["not JSON at all", "companyName=Northline"],
    ["truncated JSON", '{"companyName":'],
    ["an array", "[1,2,3]"],
    ["null", "null"],
    ["a bare string", '"hello"'],
    ["a number", "42"],
  ])("answers 400, not 500, for %s on POST", async (_label, raw) => {
    const response = await post(undefined, raw);

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it.each([
    ["not JSON at all", "companyName=Northline"],
    ["truncated JSON", '{"companyName":'],
  ])("answers 400, not 500, for %s on PATCH", async (_label, raw) => {
    const response = await patch(undefined, { raw });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses fields of the wrong type rather than coercing them", async () => {
    const response = await post({ ...VALID, companyName: 42 });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });
});

describe("when the database is unreachable", () => {
  beforeEach(() => signedInAs("admin"));

  it("answers 500 on a failed insert and never claims success", async () => {
    fake.failWrites = new Error("ECONNREFUSED");

    const response = await post(VALID);

    expect(response.status).toBe(500);
    expect((await response.json()).id).toBeUndefined();
  });

  it("does not leak the underlying error", async () => {
    fake.failWrites = new Error("password authentication failed for user 'app'");

    const payload = await (await patch({ status: "paused" })).json();

    expect(JSON.stringify(payload)).not.toMatch(/password|authentication/i);
  });
});
