import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { agencyClients, projects } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { OFFERING_LABELS, STAGE_LABELS } from "@/lib/crm";
import { SERVICE_LABELS } from "@/lib/services";

/**
 * Palette search.
 *
 * Deliberately separate from `/api/helix/resources`. That endpoint answers
 * "what may I introduce to this thread" and is filtered by a thread's existing
 * grants; this one answers "where do I want to go", and must not be. Sharing
 * one endpoint would have made the palette quietly hide anything already
 * introduced somewhere — a navigation tool that omits results is worse than no
 * navigation tool.
 */
export async function GET(request: Request) {
  try {
    await requireStaff();
    const query = (new URL(request.url).searchParams.get("q") ?? "").trim();
    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }
    const needle = `%${query}%`;

    const [clients, projectRows] = await Promise.all([
      db
        .select({
          id: agencyClients.id,
          companyName: agencyClients.companyName,
          package: agencyClients.package,
          stage: agencyClients.stage,
        })
        .from(agencyClients)
        .where(
          and(
            or(
              ilike(agencyClients.companyName, needle),
              ilike(agencyClients.contactName, needle)
            ),
            eq(agencyClients.status, "active")
          )
        )
        .orderBy(desc(agencyClients.updatedAt))
        .limit(5),
      db
        .select({
          id: projects.id,
          name: projects.name,
          serviceType: projects.serviceType,
        })
        .from(projects)
        .where(ilike(projects.name, needle))
        .orderBy(desc(projects.createdAt))
        .limit(5),
    ]);

    return NextResponse.json({
      results: [
        ...clients.map((client) => ({
          kind: "client" as const,
          id: client.id,
          label: client.companyName,
          detail: `${OFFERING_LABELS[client.package]} · ${STAGE_LABELS[client.stage]}`,
        })),
        ...projectRows.map((project) => ({
          kind: "project" as const,
          id: project.id,
          label: project.name,
          detail: SERVICE_LABELS[project.serviceType],
        })),
      ],
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/search] GET", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
