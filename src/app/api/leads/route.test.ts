/**
 * POST /api/leads — the public contact form's submit target.
 *
 * This is the only write path a stranger can reach and the only lead-capture
 * path on the site: a regression here loses business silently, because the
 * form's failure mode before this endpoint existed was to *say* "Message
 * sent!" and throw the message away. So these tests assert the two halves
 * that matter — that a real submission reaches the `leads` table with the
 * right columns, and that everything else is refused rather than half-stored.
 *
 * Database-free: `@/db` is replaced with a fake whose only job is to record
 * what `insert(...).values(...)` was handed, so the assertions are about the
 * row the route builds rather than about drizzle.
 *
 * Note on ordering: the route's rate limiter is module-level state keyed by
 * client IP, shared by every test in this file. Each test therefore submits
 * from its own IP via `from()`; the tests that deliberately exercise the
 * limiter own their IPs outright.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { leads } from "@/db/schema";
import { services } from "@/lib/services";

const fakeDb = vi.hoisted(() => ({
  /** Every `insert(table).values(row)` the route performed. */
  writes: [] as { table: unknown; row: Record<string, unknown> }[],
  /** When set, the next insert rejects — the "database is down" path. */
  failWith: null as Error | null,
}));

vi.mock("@/db", () => ({
  db: {
    insert(table: unknown) {
      return {
        async values(row: Record<string, unknown>) {
          if (fakeDb.failWith) throw fakeDb.failWith;
          fakeDb.writes.push({ table, row });
          return [];
        },
      };
    },
  },
}));

const { POST } = await import("./route");

/** A distinct IP per test, so one test's submissions never spend another's quota. */
let ipCounter = 0;
const nextIp = () => `203.0.113.${(ipCounter += 1)}`;

function post(
  body: unknown,
  { ip, raw }: { ip?: string; raw?: string } = {}
): Promise<Response> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (ip !== undefined) headers["x-forwarded-for"] = ip;
  return POST(
    new Request("https://fortitudo.agency/api/leads", {
      method: "POST",
      headers,
      body: raw ?? JSON.stringify(body),
    })
  );
}

const VALID = {
  name: "Dana Okoro",
  email: "dana@example.com",
  company: "Okoro Dental",
  service: "websites",
  message: "We need a new site before our clinic opens in March.",
};

beforeEach(() => {
  fakeDb.writes.length = 0;
  fakeDb.failWith = null;
  // The 500 path logs; keep the suite output clean and assert on it instead.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("a valid submission", () => {
  it("records the lead and answers 201", async () => {
    const response = await post(VALID, { ip: nextIp() });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(fakeDb.writes).toHaveLength(1);
    expect(fakeDb.writes[0].table).toBe(leads);
  });

  it("writes every field the form collects, plus the source", async () => {
    await post(VALID, { ip: nextIp() });

    expect(fakeDb.writes[0].row).toEqual({
      name: "Dana Okoro",
      email: "dana@example.com",
      company: "Okoro Dental",
      serviceInterest: "websites",
      message: "We need a new site before our clinic opens in March.",
      source: "contact_form",
    });
  });

  it("accepts the contact form's exact payload shape, empty optionals included", async () => {
    // src/app/(marketing)/contact/page.tsx posts its whole form state, so the
    // untouched optional fields arrive as "" rather than absent.
    const response = await post(
      { name: "Sam", email: "sam@example.com", company: "", service: "", message: "Hello" },
      { ip: nextIp() }
    );

    expect(response.status).toBe(201);
    expect(fakeDb.writes[0].row).toMatchObject({
      company: null,
      serviceInterest: null,
    });
  });

  it("stores each of the five offerings the form's select can submit", async () => {
    for (const service of services) {
      await post({ ...VALID, service: service.id }, { ip: nextIp() });
    }

    expect(fakeDb.writes.map((w) => w.row.serviceInterest)).toEqual(
      services.map((s) => s.id)
    );
  });

  it("trims surrounding whitespace before storing", async () => {
    await post(
      { name: "  Dana  ", email: "  dana@example.com  ", message: "  hi  " },
      { ip: nextIp() }
    );

    expect(fakeDb.writes[0].row).toMatchObject({
      name: "Dana",
      email: "dana@example.com",
      message: "hi",
    });
  });

  it("keeps a free-text service the select never offered", async () => {
    // Deliberate per the route's comment: a prospect who does not see
    // themselves in the five offerings should still get through.
    await post({ ...VALID, service: "drone photography" }, { ip: nextIp() });

    expect(fakeDb.writes[0].row.serviceInterest).toBe("drone photography");
  });
});

describe("required fields", () => {
  it.each([
    ["name missing", { email: VALID.email, message: VALID.message }],
    ["email missing", { name: VALID.name, message: VALID.message }],
    ["message missing", { name: VALID.name, email: VALID.email }],
    ["name empty", { ...VALID, name: "" }],
    ["message empty", { ...VALID, message: "" }],
    ["name is only whitespace", { ...VALID, name: "   " }],
    ["message is only whitespace", { ...VALID, message: "\n\t  " }],
    ["email empty", { ...VALID, email: "" }],
  ])("rejects with 400 and writes nothing: %s", async (_label, body) => {
    const response = await post(body, { ip: nextIp() });

    expect(response.status).toBe(400);
    expect(fakeDb.writes).toHaveLength(0);
  });

  it("returns an error message rather than a bare status", async () => {
    const response = await post({}, { ip: nextIp() });
    const payload = await response.json();

    expect(payload.ok).toBeUndefined();
    expect(typeof payload.error).toBe("string");
    expect(payload.error.length).toBeGreaterThan(0);
  });
});

describe("email validation", () => {
  it.each([
    "not-an-email",
    "dana@",
    "@example.com",
    "dana@example",
    "dana example@test.com",
    "dana@@example.com",
    "dana@exam ple.com",
  ])("rejects %s", async (email) => {
    const response = await post({ ...VALID, email }, { ip: nextIp() });

    expect(response.status).toBe(400);
    expect(fakeDb.writes).toHaveLength(0);
  });

  it.each([
    "dana@example.com",
    "dana+clinic@example.co.uk",
    "d.okoro@sub.example.org",
  ])("accepts %s", async (email) => {
    const response = await post({ ...VALID, email }, { ip: nextIp() });

    expect(response.status).toBe(201);
  });

  it("stores the address as typed, without case-normalising it", async () => {
    // Documents current behaviour: `leads.email` is indexed and de-duping by
    // address is left to whoever reads the table.
    await post({ ...VALID, email: "Dana@Example.com" }, { ip: nextIp() });

    expect(fakeDb.writes[0].row.email).toBe("Dana@Example.com");
  });
});

describe("oversized payloads", () => {
  it.each([
    ["name over 255", { ...VALID, name: "x".repeat(256) }],
    ["email over 255", { ...VALID, email: `${"x".repeat(250)}@example.com` }],
    ["company over 255", { ...VALID, company: "x".repeat(256) }],
    ["service over 100", { ...VALID, service: "x".repeat(101) }],
    ["message over 5000", { ...VALID, message: "x".repeat(5001) }],
  ])("rejects %s rather than letting the database truncate it", async (_l, body) => {
    const response = await post(body, { ip: nextIp() });

    expect(response.status).toBe(400);
    expect(fakeDb.writes).toHaveLength(0);
  });

  it.each([
    ["name at exactly 255", { ...VALID, name: "x".repeat(255) }],
    ["message at exactly 5000", { ...VALID, message: "x".repeat(5000) }],
    ["service at exactly 100", { ...VALID, service: "x".repeat(100) }],
  ])("accepts %s", async (_l, body) => {
    const response = await post(body, { ip: nextIp() });

    expect(response.status).toBe(201);
  });

  it("measures the caps after trimming, not before", async () => {
    const response = await post(
      { ...VALID, name: `  ${"x".repeat(255)}  ` },
      { ip: nextIp() }
    );

    expect(response.status).toBe(201);
    expect(fakeDb.writes[0].row.name).toBe("x".repeat(255));
  });

  it("refuses a megabyte of message", async () => {
    const response = await post(
      { ...VALID, message: "x".repeat(1_000_000) },
      { ip: nextIp() }
    );

    expect(response.status).toBe(400);
    expect(fakeDb.writes).toHaveLength(0);
  });
});

describe("hostile and malformed bodies", () => {
  it.each([
    ["a bare string", '"hello"'],
    ["an array", "[1,2,3]"],
    ["null", "null"],
    ["a number", "42"],
  ])("rejects %s with 400", async (_label, raw) => {
    const response = await post(undefined, { ip: nextIp(), raw });

    expect(response.status).toBe(400);
    expect(fakeDb.writes).toHaveLength(0);
  });

  it("answers 400, not 500, when the body is not JSON at all", async () => {
    // An unreadable body is the caller's mistake, and must not be reported as
    // ours. These once shared a catch with the insert, so a form-encoded body
    // told the prospect "we could not record that message" — implying we had
    // received and lost it — and logged a line that read like an outage.
    const response = await post(undefined, { ip: nextIp(), raw: "name=Dana&email=x" });

    expect(fakeDb.writes).toHaveLength(0);
    expect(response.status).toBe(400);
  });

  it("answers 400, not 500, when the body is truncated JSON", async () => {
    const response = await post(undefined, {
      ip: nextIp(),
      raw: '{"name":"Dana","email":',
    });

    expect(fakeDb.writes).toHaveLength(0);
    expect(response.status).toBe(400);
  });

  it("drops unexpected fields instead of writing them", async () => {
    // The row is built from the parsed data, so a caller cannot smuggle in
    // columns the form does not own.
    const response = await post(
      {
        ...VALID,
        id: "00000000-0000-0000-0000-000000000000",
        status: "converted",
        source: "referral",
        phone: "+1 555 0100",
        monthlyBudget: "$50,000",
        createdAt: "1999-01-01T00:00:00.000Z",
      },
      { ip: nextIp() }
    );

    expect(response.status).toBe(201);
    expect(fakeDb.writes[0].row).toEqual({
      name: VALID.name,
      email: VALID.email,
      company: VALID.company,
      serviceInterest: VALID.service,
      message: VALID.message,
      source: "contact_form",
    });
  });

  it("rejects fields of the wrong type rather than coercing them", async () => {
    const response = await post(
      { name: 42, email: VALID.email, message: VALID.message },
      { ip: nextIp() }
    );

    expect(response.status).toBe(400);
    expect(fakeDb.writes).toHaveLength(0);
  });

  it("rejects a nested object where a string belongs", async () => {
    const response = await post(
      { ...VALID, message: { toString: "nope" } },
      { ip: nextIp() }
    );

    expect(response.status).toBe(400);
  });

  it("stores script-ish input verbatim, escaping being the reader's job", async () => {
    const message = '<script>alert(1)</script> and \'; drop table leads; --';
    await post({ ...VALID, message }, { ip: nextIp() });

    expect(fakeDb.writes[0].row.message).toBe(message);
  });
});

describe("when the database is unreachable", () => {
  it("answers 500 and never claims the message was sent", async () => {
    fakeDb.failWith = new Error("ECONNREFUSED");

    const response = await post(VALID, { ip: nextIp() });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.ok).toBeUndefined();
    expect(payload.error).toMatch(/email us directly/i);
  });

  it("logs the failure so a lost lead is traceable", async () => {
    fakeDb.failWith = new Error("ECONNREFUSED");
    const logged = vi.mocked(console.error);

    await post(VALID, { ip: nextIp() });

    expect(logged).toHaveBeenCalledOnce();
    expect(logged.mock.calls[0][0]).toContain("api/leads");
  });

  it("does not leak the underlying error to the caller", async () => {
    fakeDb.failWith = new Error("password authentication failed for user 'app'");

    const payload = await (await post(VALID, { ip: nextIp() })).json();

    expect(JSON.stringify(payload)).not.toMatch(/password|ECONNREFUSED|authentication/i);
  });
});

describe("rate limiting", () => {
  it("allows five submissions from one IP and refuses the sixth", async () => {
    const ip = "198.51.100.1";

    for (let i = 0; i < 5; i += 1) {
      expect((await post(VALID, { ip })).status).toBe(201);
    }
    const sixth = await post(VALID, { ip });

    expect(sixth.status).toBe(429);
    expect((await sixth.json()).error).toMatch(/too many/i);
    expect(fakeDb.writes).toHaveLength(5);
  });

  it("does not punish a different IP for a neighbour's spray", async () => {
    const noisy = "198.51.100.2";
    for (let i = 0; i < 6; i += 1) await post(VALID, { ip: noisy });

    expect((await post(VALID, { ip: "198.51.100.3" })).status).toBe(201);
  });

  it("buckets by the client IP, not the proxy chain", async () => {
    // x-forwarded-for is "client, proxy1, proxy2" — only the first entry
    // identifies the caller, so two hops through different proxies still
    // count against the same client.
    for (let i = 0; i < 5; i += 1) {
      await post(VALID, { ip: `198.51.100.4, 10.0.0.${i}` });
    }

    const blocked = await post(VALID, { ip: "198.51.100.4, 172.16.0.9" });
    expect(blocked.status).toBe(429);
  });

  it("does not spend quota on rejected submissions", async () => {
    // Only a written row costs the caller a unit. The limiter exists to stop
    // the table being flooded, and someone who mistypes their email five times
    // must not be locked out on the attempt that finally works.
    const ip = "198.51.100.5";
    for (let i = 0; i < 5; i += 1) {
      expect((await post({ ...VALID, email: "nope" }, { ip })).status).toBe(400);
    }

    expect((await post(VALID, { ip })).status).toBe(201);
    expect(fakeDb.writes).toHaveLength(1);
  });

  it("still stops a caller who keeps submitting valid leads", async () => {
    // The other half of the same rule: rejects are free, writes are not.
    const ip = "198.51.100.6";
    for (let i = 0; i < 5; i += 1) {
      expect((await post(VALID, { ip })).status).toBe(201);
    }

    expect((await post(VALID, { ip })).status).toBe(429);
    expect(fakeDb.writes).toHaveLength(5);
  });
});

/*
 * Kept last on purpose: these spend the shared "unknown" bucket that every
 * header-less request falls into, which would otherwise starve later tests.
 */
describe("requests with no x-forwarded-for header", () => {
  it("does not let one shared bucket shut the form off after five leads", async () => {
    // Every header-less caller keys to the same string, because the route has
    // no way to tell them apart. With the normal allowance of five, one
    // misconfigured proxy in front of the app would stop the site accepting
    // leads from anyone — silently, blaming the prospect's connection. The
    // anonymous bucket therefore gets its own much larger ceiling.
    for (let i = 0; i < 20; i += 1) {
      expect((await post(VALID)).status).toBe(201);
    }
  });

  it("still has a ceiling", async () => {
    // Larger, not absent: it is the last thing standing between an unproxied
    // deployment and an unbounded write path.
    for (let i = 0; i < 500; i += 1) {
      await post(VALID);
    }

    expect((await post(VALID)).status).toBe(429);
  });
});
