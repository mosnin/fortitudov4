/**
 * Seed the studio with its catalog and architects.
 *
 * Usage:
 *   1. Set DATABASE_URL in .env.local (Supabase direct or pooler connection)
 *   2. pnpm db:migrate   (apply schema)
 *   3. pnpm db:seed
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { teamMembers, catalogItems } from "../src/db/schema";
import { catalog } from "../src/lib/catalog";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Configure it in .env.local first.");
  process.exit(1);
}

const client = postgres(databaseUrl, { prepare: false });
const db = drizzle(client);

const architects = [
  { name: "Mara Vance", title: "Principal Architect · Software", discipline: "software" as const, bio: "Leads software builds end to end — from data model to deploy." },
  { name: "Tomas Ek", title: "Commerce Lead", discipline: "commerce" as const, bio: "Designs commerce systems that scale and convert." },
  { name: "Priya Nadar", title: "AI Architect", discipline: "ai" as const, bio: "Builds AI-native products with the right guardrails." },
  { name: "Devon Cole", title: "Infrastructure Lead", discipline: "infrastructure" as const, bio: "Cloud, pipelines, and reliability — the calm foundation." },
];

async function main() {
  console.log("Seeding catalog…");
  await db
    .insert(catalogItems)
    .values(
      catalog.map((c) => ({
        slug: c.slug,
        discipline: c.discipline,
        name: c.name,
        summary: c.summary,
        description: c.description,
        fromPrice: c.fromPrice,
        fixedPrice: c.fixedPrice,
        agentPurchasable: c.agentPurchasable,
        features: c.features,
        estimatedTimeline: c.estimatedTimeline,
      }))
    )
    .onConflictDoNothing({ target: catalogItems.slug });

  // Seed architects only if the table is empty (keeps re-runs idempotent).
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teamMembers);

  if (Number(count) === 0) {
    console.log("Seeding architects…");
    await db.insert(teamMembers).values(architects);
  } else {
    console.log("Architects already present — skipping.");
  }

  console.log("Done.");
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
