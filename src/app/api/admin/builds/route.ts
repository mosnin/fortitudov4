import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { createInvitedBuild } from "@/lib/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().max(120).optional(),
  businessName: z.string().min(1).max(255),
  discipline: z.enum(["software", "commerce", "ai", "infrastructure"]),
  description: z.string().min(1).max(4000),
  features: z.array(z.string().max(200)).max(20).optional(),
  timeline: z.string().max(200).optional(),
  budget: z.string().max(200).optional(),
  additionalNotes: z.string().max(2000).optional(),
});

// Admin creates a build for a client and gets back an invite code.
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createInvitedBuild(user.id, parsed.data);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create build";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
