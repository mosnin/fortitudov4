import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { coreProducts, applicableAddons, type Addon } from "@/lib/configurator";
import { createProjectFromConfig } from "@/lib/studio";
import type { BlueprintLineItem, BlueprintScopeItem } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  coreId: z.string(),
  addonIds: z.array(z.string()).max(20).default([]),
  businessName: z.string().min(1).max(255),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rate = await checkRateLimit(user.id + ":configure", 20);
    if (!rate.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const core = coreProducts.find((c) => c.id === parsed.data.coreId);
    if (!core) return NextResponse.json({ error: "Unknown product" }, { status: 400 });

    // Re-derive add-ons + prices server-side (never trust client totals).
    const allowed = applicableAddons(core.discipline);
    const selected: Addon[] = allowed.filter((a) => parsed.data.addonIds.includes(a.id));

    const lineItems: BlueprintLineItem[] = [
      { label: core.name, description: core.tagline, amount: core.price },
      ...selected.map((a) => ({ label: a.name, description: a.description, amount: a.price })),
    ];
    const total = lineItems.reduce((s, li) => s + li.amount, 0);

    const scope: BlueprintScopeItem[] = [
      ...core.features.map((f) => ({ title: f })),
      ...selected.map((a) => ({ title: a.name, detail: a.description })),
    ];

    const expedited = selected.some((a) => a.id === "expedited");
    const summary = `${core.description}${selected.length ? ` Plus: ${selected.map((a) => a.name).join(", ")}.` : ""}`;

    const { project, blueprint } = await createProjectFromConfig(user.id, {
      businessName: parsed.data.businessName,
      discipline: core.discipline,
      title: `${core.name} — ${parsed.data.businessName}`,
      summary,
      scope,
      lineItems,
      total,
      estimatedTimeline: expedited ? `${core.timeline} (expedited)` : core.timeline,
      features: [...core.features, ...selected.map((a) => a.name)],
      notes: parsed.data.notes,
    });

    return NextResponse.json({ projectId: project.id, blueprintId: blueprint.id, total }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
