import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveConnectionString } from "./index";

const POOLED = "postgresql://u:p@ep-cool-dawn-123-pooler.us-east-1.aws.neon.tech/main";
const DIRECT = "postgresql://u:p@ep-cool-dawn-123.us-east-1.aws.neon.tech/main";
const PLAIN  = "postgresql://u:p@plain.example.com:5432/postgres";

let saved: NodeJS.ProcessEnv;
beforeEach(() => { saved = process.env; process.env = {} as NodeJS.ProcessEnv; });
afterEach(() => { process.env = saved; });

describe("resolveConnectionString", () => {
  it("uses DATABASE_URL when present", () => {
    process.env.DATABASE_URL = PLAIN;
    expect(resolveConnectionString()).toBe(PLAIN);
  });

  it("finds the PRODUCTION shape: only STORAGE_-prefixed vars, and prefers pooled", () => {
    process.env.STORAGE_POSTGRES_URL_NON_POOLING = DIRECT;
    process.env.STORAGE_POSTGRES_PRISMA_URL = POOLED;
    process.env.STORAGE_POSTGRES_URL = POOLED;
    expect(resolveConnectionString()).toBe(POOLED);
  });

  it("falls back to a direct connection only when nothing pooled exists", () => {
    process.env.STORAGE_POSTGRES_URL_NON_POOLING = DIRECT;
    expect(resolveConnectionString()).toBe(DIRECT);
  });

  it("finds the NEON-VERCEL shape and still prefers pooled", () => {
    // Exactly what the Neon integration writes. DATABASE_URL_UNPOOLED is a
    // name this resolver had never been tested against — the last time
    // production used a variable name no test covered, the app found nothing
    // and the database went down.
    process.env.DATABASE_URL = POOLED;
    process.env.DATABASE_URL_UNPOOLED = DIRECT;
    process.env.POSTGRES_URL = POOLED;
    process.env.POSTGRES_URL_NON_POOLING = DIRECT;
    process.env.POSTGRES_PRISMA_URL = POOLED;
    expect(resolveConnectionString()).toBe(POOLED);
  });

  it("treats DATABASE_URL_UNPOOLED as direct, not as a pooled candidate", () => {
    // The whole point of the ranking. If `UNPOOLED` were not recognised as
    // direct it would sort first alphabetically and win, and every lambda
    // would open its own session against the unpooled endpoint.
    process.env.STORAGE_DATABASE_URL_UNPOOLED = DIRECT;
    process.env.STORAGE_POSTGRES_URL = POOLED;
    expect(resolveConnectionString()).toBe(POOLED);
  });

  it("uses the unpooled URL when it is genuinely the only one", () => {
    process.env.DATABASE_URL_UNPOOLED = DIRECT;
    expect(resolveConnectionString()).toBe(DIRECT);
  });

  it("ignores env values that merely look like URLs", () => {
    process.env.SOME_OTHER_SECRET = "postgresql://not-a-connection-var";
    expect(() => resolveConnectionString()).toThrow(/No Postgres connection string/);
  });

  it("throws with a message naming what it looked for", () => {
    expect(() => resolveConnectionString()).toThrow(/DATABASE_URL/);
  });
});
