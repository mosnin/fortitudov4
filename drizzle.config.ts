import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

/* Migrations want the DIRECT connection, not the pooled one.
   On Neon that is the `DATABASE_URL_UNPOOLED` the Vercel integration sets (host
   without `-pooler`). drizzle-kit issues DDL and inspects the catalog, and a
   pgBouncer in transaction mode is the wrong thing to do that through — it can
   hand consecutive statements to different backends.
   The runtime resolver in src/db/index.ts deliberately prefers the opposite,
   for the opposite reason. */
const connectionString =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  "";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
