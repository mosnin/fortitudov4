import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Match src/db/index.ts: prefer any Supabase Postgres URL found in the env,
// then fall back to the standard integration vars.
const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);
const connectionString =
  Object.values(process.env).find((v) => isPgUrl(v) && v.includes("supabase.co")) ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
