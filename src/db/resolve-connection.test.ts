import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveConnectionString } from "./index";

const POOLED = "postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:6543/postgres";
const DIRECT = "postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:5432/postgres";
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

  it("ignores env values that merely look like URLs", () => {
    process.env.SOME_OTHER_SECRET = "postgresql://not-a-connection-var";
    expect(() => resolveConnectionString()).toThrow(/No Postgres connection string/);
  });

  it("throws with a message naming what it looked for", () => {
    expect(() => resolveConnectionString()).toThrow(/DATABASE_URL/);
  });
});
