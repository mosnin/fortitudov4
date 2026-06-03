import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Match src/db/index.ts: prefer the Vercel Supabase integration's POSTGRES_URL,
// fall back to DATABASE_URL, and never use a stale Neon URL.
const candidates = [
  process.env.POSTGRES_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL_NON_POOLING,
].filter((u): u is string => Boolean(u));
const connectionString =
  candidates.find((u) => !u.includes("neon.tech")) ?? candidates[0] ?? "";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
