/**
 * The partner request write layer — POST /api/partner-requests and
 * PATCH /api/partner-requests/[id].
 *
 * A partner request is a commercial document: it carries someone else's budget
 * and the price we are going to invoice against. The deny cases are therefore
 * the deliverable, not the trimming — a partner reaching another partner's
 * request is the failure that ends a business relationship, and a partner who
 * can set `quotedCents` can set what we invoice ourselves.
 *
 * So nearly every test below asserts two things: the status the caller got,
 * and that `fake.writes` is empty. A refusal that still wrote a row is the
 * exact bug this file exists to catch, and it looks like success from outside.
 *
 * Database-free, in the style of api/leads/route.test.ts: `@/db` is a fake that
 * records what reached `insert(...).values(...)` / `update(...).set(...)` and
 * returns rows the test staged, and Clerk is stubbed to a bare user id. The
 * assertions are about the row the route builds, never about drizzle.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  partnerRequests,
  partners,
  users,
  type UserRole,
} from "@/db/schema";
import { PARTNER_REQUEST_STATUSES } from "@/lib/partners";
import { services } from "@/lib/services";

const fake = vi.hoisted(() => ({
  /** Rows the next select against a given table returns. */
  rows: new Map<unknown, unknown[]>(),
  /** Every insert/update the route performed. Must stay empty on a refusal. */
  writes: [] as {
    kind: "insert" | "update";
    table: unknown;
    row: Record<string, unknown>;
  }[],
  /** Rows an update returns; [] models "no such id". */
  updateReturns: null as unknown[] | null,
  /** Who Clerk says is signed in. */
  clerkId: null as string | null,
  /** When set, the next read rejects — the "database is down" path. */
  failWith: null as Error | null,
  /** When set, the next write rejects, reads still working. */
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
        return Promise.resolve(fake.rows.get(table) ?? []).then(onFulfilled, onRejected);
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

const PARTNER_USER = "11111111-0000-4000-8000-000000000001";
const STAFF_USER = "11111111-0000-4000-8000-000000000002";
const MY_PARTNER = "22222222-0000-4000-8000-000000000001";
const OTHER_PARTNER = "22222222-0000-4000-8000-000000000002";
const REQUEST_ID = "33333333-0000-4000-8000-000000000001";
const PROJECT_ID = "44444444-0000-4000-8000-000000000001";

function post(body: unknown, raw?: string): Promise<Response> {
  return POST(
    new Request("https://fortitudo.agency/api/partner-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw ?? JSON.stringify(body),
    })
  );
}

function patch(body: unknown, { id = REQUEST_ID, raw }: { id?: string; raw?: string } = {}) {
  return PATCH(
    new Request(`https://fortitudo.agency/api/partner-requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: raw ?? JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );
}

/** Stage the `users` row getAuthenticatedUser looks up. */
function signedInAs(role: UserRole | string, id = PARTNER_USER) {
  fake.clerkId = `clerk_${id}`;
  fake.rows.set(users, [{ id, role, clerkId: `clerk_${id}`, email: "a@b.com" }]);
}

/** Signed in as a partner whose own partner record is MY_PARTNER. */
function signedInAsPartner() {
  signedInAs("partner", PARTNER_USER);
  fake.rows.set(partners, [{ id: MY_PARTNER, status: "active" }]);
}

/** Stage the request PATCH will load. */
function existingRequest(overrides: Record<string, unknown> = {}) {
  fake.rows.set(partnerRequests, [
    {
      id: REQUEST_ID,
      partnerId: MY_PARTNER,
      title: "Clinic site",
      scope: "Five pages",
      serviceType: "websites",
      budgetCents: 500_000,
      quotedCents: null,
      status: "draft",
      targetDate: null,
      projectId: null,
      createdBy: PARTNER_USER,
      ...overrides,
    },
  ]);
}

const VALID_CREATE = {
  title: "Clinic site for Okoro Dental",
  scope: "Five pages and a booking form.",
  serviceType: "websites",
  budgetCents: 750_000,
};

beforeEach(() => {
  fake.rows.clear();
  fake.writes.length = 0;
  fake.updateReturns = null;
  fake.clerkId = null;
  fake.failWith = null;
  fake.failWrites = null;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// ─────────────────────────────────────────────────────────────────────────────
// Who may reach the routes at all
// ─────────────────────────────────────────────────────────────────────────────

describe("callers with no business here", () => {
  it("refuses an unauthenticated POST with 401 and writes nothing", async () => {
    const response = await post(VALID_CREATE);

    expect(response.status).toBe(401);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses an unauthenticated PATCH with 401 and writes nothing", async () => {
    const response = await patch({ title: "x" });

    expect(response.status).toBe(401);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses a signed-in session with no database row", async () => {
    fake.clerkId = "clerk_brand_new";

    expect((await post(VALID_CREATE)).status).toBe(404);
    expect(fake.writes).toHaveLength(0);
  });

  it.each<UserRole>(["va", "client"])("refuses %s on POST with 403", async (role) => {
    signedInAs(role, STAFF_USER);

    const response = await post({ ...VALID_CREATE, partnerId: MY_PARTNER });

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it.each<UserRole>(["va", "client"])("refuses %s on PATCH with 403", async (role) => {
    signedInAs(role, STAFF_USER);
    existingRequest();

    const response = await patch({ title: "Renamed" });

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses a VA before it ever loads the request", async () => {
    // A VA must not be able to use this route as an existence oracle either.
    signedInAs("va", STAFF_USER);

    const response = await patch({ title: "Renamed" }, { id: REQUEST_ID });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
  });

  it.each(["", "owner", "Partner", "partner ", "__proto__"])(
    "refuses the unrecognised role %o",
    async (role) => {
      signedInAs(role, STAFF_USER);

      expect((await post(VALID_CREATE)).status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it("refuses a partner-role account with no partner record", async () => {
    // The role alone grants nothing: the partnerId comes from a row.
    signedInAs("partner");
    fake.rows.set(partners, []);

    const response = await post(VALID_CREATE);

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it.each(["paused", "archived"])(
    "refuses a %s partner opening new work",
    async (status) => {
      // partners.status was resolved and then never consulted, so an archived
      // relationship behaved exactly like a live one. Reading stays open —
      // someone we have stopped working with can still see what we did
      // together — but they cannot start something new.
      signedInAs("partner");
      fake.rows.set(partners, [{ id: MY_PARTNER, status }]);

      const response = await post(VALID_CREATE);

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it("still lets an active partner through", async () => {
    // The other half of the same rule: the gate must be the status, not the
    // existence of a status check.
    signedInAs("partner");
    fake.rows.set(partners, [{ id: MY_PARTNER, status: "active" }]);

    expect((await post(VALID_CREATE)).status).toBe(201);
    expect(fake.writes).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST — a partner opening their own request
// ─────────────────────────────────────────────────────────────────────────────

describe("a partner opening a request", () => {
  beforeEach(signedInAsPartner);

  it("writes it against their own partner record", async () => {
    const response = await post(VALID_CREATE);

    expect(response.status).toBe(201);
    expect(fake.writes).toHaveLength(1);
    expect(fake.writes[0].table).toBe(partnerRequests);
    expect(fake.writes[0].row).toMatchObject({
      partnerId: MY_PARTNER,
      title: VALID_CREATE.title,
      serviceType: "websites",
      budgetCents: 750_000,
      status: "draft",
      createdBy: PARTNER_USER,
    });
  });

  it("attaches THEIR partnerId however loudly the body claims another", async () => {
    // The whole scoping rule is "rows whose partnerId is their own". A
    // body-supplied owner is how one partner's request lands in another's
    // queue, so the body is not consulted — the partners row is.
    const response = await post({ ...VALID_CREATE, partnerId: OTHER_PARTNER });

    expect(response.status).toBe(201);
    expect(fake.writes[0].row.partnerId).toBe(MY_PARTNER);
  });

  it("returns the created row, not a bare ok", async () => {
    const payload = await (await post(VALID_CREATE)).json();

    expect(payload.title).toBe(VALID_CREATE.title);
    expect(payload.partnerId).toBe(MY_PARTNER);
  });

  it("defaults to draft when no status is given", async () => {
    await post(VALID_CREATE);

    expect(fake.writes[0].row.status).toBe("draft");
  });

  it("accepts an explicit draft", async () => {
    await post({ ...VALID_CREATE, status: "draft" });

    expect(fake.writes[0].row.status).toBe("draft");
  });

  it("accepts submitted — their own draft → submitted, in one step", async () => {
    const response = await post({ ...VALID_CREATE, status: "submitted" });

    expect(response.status).toBe(201);
    expect(fake.writes[0].row.status).toBe("submitted");
  });

  it.each(["reviewing", "quoted", "accepted", "declined", "delivered"])(
    "refuses a request opened straight into %s",
    async (status) => {
      const response = await post({ ...VALID_CREATE, status });

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it("stores every one of the five offerings", async () => {
    for (const service of services) {
      await post({ ...VALID_CREATE, serviceType: service.id });
    }

    expect(fake.writes.map((w) => w.row.serviceType)).toEqual(
      services.map((s) => s.id)
    );
  });

  it("refuses a serviceType outside the five offerings", async () => {
    const response = await post({ ...VALID_CREATE, serviceType: "drone photography" });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("trims before capping, and stores the trimmed value", async () => {
    await post({ ...VALID_CREATE, title: `  ${"x".repeat(255)}  ` });

    expect(fake.writes[0].row.title).toBe("x".repeat(255));
  });

  it.each([
    ["title over 255", { title: "x".repeat(256) }],
    ["title empty", { title: "" }],
    ["title only whitespace", { title: "   " }],
    ["title missing", { title: undefined }],
    ["scope over 5000", { scope: "x".repeat(5001) }],
    ["serviceType missing", { serviceType: undefined }],
  ])("refuses %s with 400", async (_label, patchBody) => {
    const body: Record<string, unknown> = { ...VALID_CREATE, ...patchBody };
    for (const [k, v] of Object.entries(patchBody)) if (v === undefined) delete body[k];

    const response = await post(body);

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("accepts a target date as an <input type=date> submits it", async () => {
    await post({ ...VALID_CREATE, targetDate: "2026-09-01" });

    expect(fake.writes[0].row.targetDate).toEqual(new Date("2026-09-01T00:00:00.000Z"));
  });

  it("accepts a full ISO timestamp too", async () => {
    await post({ ...VALID_CREATE, targetDate: "2026-09-01T09:30:00.000Z" });

    expect(fake.writes[0].row.targetDate).toEqual(
      new Date("2026-09-01T09:30:00.000Z")
    );
  });

  it("refuses a target date that is not a date", async () => {
    const response = await post({ ...VALID_CREATE, targetDate: "next spring" });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Money
// ─────────────────────────────────────────────────────────────────────────────

describe("budgetCents is integer cents", () => {
  beforeEach(signedInAsPartner);

  it.each([
    ["a float", 1234.56],
    ["a negative", -1],
    ["a numeric string", "750000"],
    ["a formatted string", "$7,500"],
    ["a boolean", true],
    ["an object", {}],
    ["over the int4 ceiling", 2_147_483_648],
  ])("refuses %s and writes nothing", async (_label, budgetCents) => {
    const response = await post({ ...VALID_CREATE, budgetCents });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it.each([0, 1, 750_000, 2_147_483_647])("accepts %d", async (budgetCents) => {
    const response = await post({ ...VALID_CREATE, budgetCents });

    expect(response.status).toBe(201);
    expect(fake.writes.at(-1)?.row.budgetCents).toBe(budgetCents);
  });

  it("stores an omitted budget as null rather than 0", async () => {
    // 0 is a stated budget of nothing; null is "they did not say".
    await post({
      title: VALID_CREATE.title,
      scope: VALID_CREATE.scope,
      serviceType: VALID_CREATE.serviceType,
    });

    expect(fake.writes[0].row.budgetCents).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// The columns that are ours
// ─────────────────────────────────────────────────────────────────────────────

describe("columns a partner may never write", () => {
  beforeEach(signedInAsPartner);

  it("refuses quotedCents on create — our price is not theirs to set", async () => {
    const response = await post({ ...VALID_CREATE, quotedCents: 1 });

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses quotedCents even when every other field is valid", async () => {
    // The tempting bug is to strip the bad column and write the good ones. A
    // caller who asked to set our price gets an answer, not a partial write.
    existingRequest();
    const response = await patch({ title: "A perfectly good title", quotedCents: 1 });

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it("leaves quotedCents untouched on the update it refuses", async () => {
    existingRequest({ quotedCents: 900_000 });

    await patch({ scope: "More pages", quotedCents: 1 });

    expect(fake.writes).toHaveLength(0);
  });

  it.each(["quotedCents", "projectId", "createdBy", "id", "createdAt", "updatedAt"])(
    "refuses %s on update",
    async (field) => {
      existingRequest();

      const response = await patch({ title: "Renamed", [field]: PROJECT_ID });

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it("refuses partnerId on update — reassignment is not an edit", async () => {
    existingRequest();

    const response = await patch({ partnerId: OTHER_PARTNER });

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses projectId on create", async () => {
    const response = await post({ ...VALID_CREATE, projectId: PROJECT_ID });

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it("names the column it refused, so the caller can fix it", async () => {
    const payload = await (await post({ ...VALID_CREATE, quotedCents: 1 })).json();

    expect(payload.error).toMatch(/quotedCents/);
  });

  it("drops unknown fields instead of writing them", async () => {
    const response = await post({
      ...VALID_CREATE,
      invoiceTotal: 999,
      commissionPct: 50,
      partnerLedgerId: "nope",
      isAdmin: true,
    });

    expect(response.status).toBe(201);
    expect(Object.keys(fake.writes[0].row).sort()).toEqual(
      [
        "budgetCents",
        "createdBy",
        "partnerId",
        "scope",
        "serviceType",
        "status",
        "targetDate",
        "title",
      ].sort()
    );
  });

  it("treats __proto__ in a body as an ordinary unknown field", async () => {
    // JSON.parse makes `__proto__` an own property rather than a prototype, so
    // the protected-field scan uses hasOwnProperty and the schema drops it.
    const response = await post(
      undefined,
      '{"title":"Clinic site","serviceType":"websites","__proto__":{"role":"admin"}}'
    );

    expect(response.status).toBe(201);
    expect(fake.writes[0].row).not.toHaveProperty("role");
    expect(fake.writes[0].row.partnerId).toBe(MY_PARTNER);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-tenant reach — the primary threat
// ─────────────────────────────────────────────────────────────────────────────

describe("one partner reaching another partner's request", () => {
  beforeEach(signedInAsPartner);

  it("answers 404, not 403, and writes nothing", async () => {
    // 403 would confirm the row exists, which is itself a read of someone
    // else's data. Missing and not-yours must be indistinguishable.
    existingRequest({ partnerId: OTHER_PARTNER });

    const response = await patch({ title: "Renamed" });

    expect(response.status).toBe(404);
    expect(fake.writes).toHaveLength(0);
  });

  it("answers the same 404 for a request that does not exist", async () => {
    fake.rows.set(partnerRequests, []);

    const missing = await patch({ title: "Renamed" });
    const notMine = await (async () => {
      existingRequest({ partnerId: OTHER_PARTNER });
      return patch({ title: "Renamed" });
    })();

    expect(missing.status).toBe(notMine.status);
    expect(await missing.json()).toEqual(await notMine.json());
  });

  it("refuses a submit on someone else's draft with the same 404", async () => {
    existingRequest({ partnerId: OTHER_PARTNER, status: "draft" });

    const response = await patch({ status: "submitted" });

    expect(response.status).toBe(404);
    expect(fake.writes).toHaveLength(0);
  });

  it("does not leak the other partner's request in the body", async () => {
    existingRequest({ partnerId: OTHER_PARTNER, title: "Their confidential job" });

    const payload = await (await patch({ title: "Renamed" })).json();

    expect(JSON.stringify(payload)).not.toMatch(/confidential|Their/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH — what a partner may edit, and when
// ─────────────────────────────────────────────────────────────────────────────

describe("a partner editing their own request", () => {
  beforeEach(signedInAsPartner);

  it.each(["draft", "submitted"])("edits the five columns while %s", async (status) => {
    existingRequest({ status });

    const response = await patch({
      title: "Renamed",
      scope: "Six pages",
      serviceType: "software_solutions",
      budgetCents: 900_000,
      targetDate: "2026-10-01",
    });

    expect(response.status).toBe(200);
    expect(fake.writes).toHaveLength(1);
    expect(fake.writes[0].row).toMatchObject({
      title: "Renamed",
      scope: "Six pages",
      serviceType: "software_solutions",
      budgetCents: 900_000,
    });
  });

  it("stamps updatedAt", async () => {
    existingRequest();

    await patch({ title: "Renamed" });

    expect(fake.writes[0].row.updatedAt).toBeInstanceOf(Date);
  });

  it("writes only the fields the body carried", async () => {
    existingRequest();

    await patch({ title: "Renamed" });

    expect(Object.keys(fake.writes[0].row).sort()).toEqual(["title", "updatedAt"]);
  });

  it.each(["reviewing", "quoted", "accepted", "declined", "delivered"])(
    "refuses an edit once the request is %s",
    async (status) => {
      // Once we are quoting against it, the thing being quoted stops moving.
      existingRequest({ status });

      const response = await patch({ title: "Renamed" });

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it.each(["reviewing", "quoted", "accepted", "declined", "delivered"])(
    "refuses a budget change once the request is %s",
    async (status) => {
      existingRequest({ status });

      const response = await patch({ budgetCents: 1 });

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it("refuses a PATCH that changes nothing", async () => {
    existingRequest();

    const response = await patch({});

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("refuses a body of nothing but unknown fields rather than writing them", async () => {
    existingRequest();

    const response = await patch({ commissionPct: 50, splitPct: 50 });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("drops unknown fields alongside a legitimate one", async () => {
    existingRequest();

    const response = await patch({ title: "Renamed", commissionPct: 50 });

    expect(response.status).toBe(200);
    expect(fake.writes[0].row).not.toHaveProperty("commissionPct");
  });

  it("rejects a bad id before loading anything", async () => {
    const response = await patch({ title: "Renamed" }, { id: "not-a-uuid" });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });
});

describe("the one status change a partner owns", () => {
  beforeEach(signedInAsPartner);

  it("allows draft → submitted", async () => {
    existingRequest({ status: "draft" });

    const response = await patch({ status: "submitted" });

    expect(response.status).toBe(200);
    expect(fake.writes[0].row).toMatchObject({ status: "submitted" });
  });

  it("allows draft → submitted alongside a final edit", async () => {
    existingRequest({ status: "draft" });

    const response = await patch({ title: "Final title", status: "submitted" });

    expect(response.status).toBe(200);
    expect(fake.writes[0].row).toMatchObject({
      title: "Final title",
      status: "submitted",
    });
  });

  it("refuses submitted → draft — un-submitting is ours", async () => {
    existingRequest({ status: "submitted" });

    const response = await patch({ status: "draft" });

    expect(response.status).toBe(403);
    expect(fake.writes).toHaveLength(0);
  });

  it.each(PARTNER_REQUEST_STATUSES.filter((s) => s !== "submitted"))(
    "refuses draft → %s",
    async (next) => {
      existingRequest({ status: "draft" });

      const response = await patch({ status: next });

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it.each(PARTNER_REQUEST_STATUSES)(
    "refuses every transition out of submitted, including to %s",
    async (next) => {
      existingRequest({ status: "submitted" });

      const response = await patch({ status: next });

      expect(response.status).toBe(403);
      expect(fake.writes).toHaveLength(0);
    }
  );

  it.each(["reviewing", "quoted", "accepted", "declined", "delivered"])(
    "refuses any status change once the request is %s",
    async (status) => {
      existingRequest({ status });

      for (const next of PARTNER_REQUEST_STATUSES) {
        const response = await patch({ status: next });
        expect(response.status).toBe(403);
      }
      expect(fake.writes).toHaveLength(0);
    }
  );

  it("refuses a status that is not a status at all with 400", async () => {
    existingRequest({ status: "draft" });

    const response = await patch({ status: "approved-by-me" });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────────────────────

describe("admin and project_manager", () => {
  it.each<UserRole>(["admin", "project_manager"])(
    "%s opens a request on a partner's behalf",
    async (role) => {
      signedInAs(role, STAFF_USER);
      fake.rows.set(partners, [{ id: OTHER_PARTNER, status: "active" }]);

      const response = await post({
        ...VALID_CREATE,
        partnerId: OTHER_PARTNER,
        quotedCents: 1_200_000,
      });

      expect(response.status).toBe(201);
      expect(fake.writes[0].row).toMatchObject({
        partnerId: OTHER_PARTNER,
        quotedCents: 1_200_000,
        createdBy: STAFF_USER,
      });
    }
  );

  it("404s when the named partner does not exist", async () => {
    signedInAs("admin", STAFF_USER);
    fake.rows.set(partners, []);

    const response = await post({ ...VALID_CREATE, partnerId: OTHER_PARTNER });

    expect(response.status).toBe(404);
    expect(fake.writes).toHaveLength(0);
  });

  it("requires a partnerId — a request with no owner is not a request", async () => {
    signedInAs("admin", STAFF_USER);

    const response = await post(VALID_CREATE);

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it.each(PARTNER_REQUEST_STATUSES)("moves a request to %s", async (status) => {
    signedInAs("project_manager", STAFF_USER);
    existingRequest({ status: "submitted" });

    const response = await patch({ status });

    expect(response.status).toBe(200);
    expect(fake.writes[0].row).toMatchObject({ status });
  });

  it("sets the quote a partner may not", async () => {
    signedInAs("admin", STAFF_USER);
    existingRequest({ status: "reviewing" });

    const response = await patch({ quotedCents: 1_450_000, status: "quoted" });

    expect(response.status).toBe(200);
    expect(fake.writes[0].row).toMatchObject({ quotedCents: 1_450_000 });
  });

  it("links an accepted request to the project it became", async () => {
    signedInAs("admin", STAFF_USER);
    existingRequest({ status: "accepted" });

    await patch({ projectId: PROJECT_ID });

    expect(fake.writes[0].row).toMatchObject({ projectId: PROJECT_ID });
  });

  it("edits another partner's request — staff are not tenant-scoped", async () => {
    signedInAs("admin", STAFF_USER);
    existingRequest({ partnerId: OTHER_PARTNER });

    expect((await patch({ title: "Renamed" })).status).toBe(200);
  });

  it("cannot reassign a request to another partner", async () => {
    // Not an edit: it would hand one partner's document to another. Dropped
    // rather than written.
    signedInAs("admin", STAFF_USER);
    existingRequest();

    const response = await patch({ title: "Renamed", partnerId: OTHER_PARTNER });

    expect(response.status).toBe(200);
    expect(fake.writes[0].row).not.toHaveProperty("partnerId");
  });

  it("404s on a request id that does not exist", async () => {
    signedInAs("admin", STAFF_USER);
    fake.updateReturns = [];

    const response = await patch({ title: "Renamed" });

    expect(response.status).toBe(404);
  });

  it("still refuses a float quote", async () => {
    signedInAs("admin", STAFF_USER);
    existingRequest();

    const response = await patch({ quotedCents: 1450.5 });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Malformed bodies and failure
// ─────────────────────────────────────────────────────────────────────────────

describe("malformed bodies", () => {
  beforeEach(signedInAsPartner);

  it.each([
    ["not JSON at all", "title=Clinic&serviceType=websites"],
    ["truncated JSON", '{"title":"Clinic","serviceType":'],
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
    ["not JSON at all", "title=Clinic"],
    ["truncated JSON", '{"title":'],
  ])("answers 400, not 500, for %s on PATCH", async (_label, raw) => {
    existingRequest();

    const response = await patch(undefined, { raw });

    expect(response.status).toBe(400);
    expect(fake.writes).toHaveLength(0);
  });

  it("returns an error string rather than a bare status", async () => {
    const payload = await (await post(undefined, "nope")).json();

    expect(typeof payload.error).toBe("string");
    expect(payload.error.length).toBeGreaterThan(0);
  });
});

describe("when the database is unreachable", () => {
  it("answers 500 when the write fails, and never claims the request was opened", async () => {
    signedInAsPartner();
    fake.failWrites = new Error("ECONNREFUSED");

    const response = await post(VALID_CREATE);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(fake.writes).toHaveLength(0);
    expect(payload.id).toBeUndefined();
  });

  it("answers 500 when the ownership lookup itself fails", async () => {
    // The lookup that establishes whose request this is must never fail open.
    signedInAsPartner();
    fake.failWith = new Error("ECONNREFUSED");

    const response = await post(VALID_CREATE);

    expect(response.status).toBe(500);
    expect(fake.writes).toHaveLength(0);
  });

  it("does not leak the underlying error to the caller", async () => {
    signedInAsPartner();
    fake.failWrites = new Error("password authentication failed for user 'app'");

    const payload = await (await post(VALID_CREATE)).json();

    expect(JSON.stringify(payload)).not.toMatch(/password|authentication/i);
  });
});
