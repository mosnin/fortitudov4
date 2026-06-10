import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { getProjectSettings, saveProjectSettings } from "@/lib/project-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-build settings: autonomy level + bespoke brand theming for the client portal.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    return NextResponse.json(await getProjectSettings(id));
  } catch (e) {
    if (e instanceof NextResponse) return e;
    const message = e instanceof Error ? e.message : "Failed to load settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const schema = z.object({
  autonomyLevel: z.enum(["manual", "assisted", "autonomous"]).optional(),
  brandColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/)
    .nullable()
    .optional(),
  brandName: z.string().max(255).nullable().optional(),
  conciergeEnabled: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    return NextResponse.json(await saveProjectSettings(id, parsed.data));
  } catch (e) {
    if (e instanceof NextResponse) return e;
    const message = e instanceof Error ? e.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
