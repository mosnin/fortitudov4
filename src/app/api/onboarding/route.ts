import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { createProjectFromBrief } from "@/lib/studio";
import { z } from "zod";

// The Brief — what the client tells us they want built. On submit we create the
// project and generate a bespoke Blueprint, then send the client to it.
const briefSchema = z.object({
  discipline: z.enum(["software", "commerce", "ai", "infrastructure"]),
  catalogSlug: z.string().max(100).optional(),
  businessName: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  features: z.array(z.string().max(255)).max(50).optional(),
  targetAudience: z.string().max(2000).optional(),
  timeline: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  brandColors: z.string().max(500).optional(),
  additionalNotes: z.string().max(5000).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    const rateLimit = checkRateLimit(user.id + ":brief", 10);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = briefSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { project, blueprint } = await createProjectFromBrief(user.id, parsed.data);

    return NextResponse.json({ projectId: project.id, blueprintId: blueprint.id });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Brief error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
