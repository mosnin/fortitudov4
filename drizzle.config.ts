import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Set DATABASE_URL to your Supabase connection string (use the Session pooler /
// direct connection, port 5432, for migrations).
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
