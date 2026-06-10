import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { createIssue, listIssues, SEVERITIES } from "@/lib/issues";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// List the issues on a build (anyone with project access).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    await verifyProjectAccess(id, user.id, user.role);
    return NextResponse.json(await listIssues(id));
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: "Failed to load issues" }, { status: 500 });
  }
}

const schema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(4000).optional(),
  severity: z.enum(SEVERITIES as [string, ...string[]]).optional(),
});

// Raise an issue on a build.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    await verifyProjectAccess(id, user.id, user.role);

    const rl = await checkRateLimit(user.id + ":issues", 20);
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "A title is required." }, { status: 400 });

    const issue = await createIssue({
      projectId: id,
      raisedBy: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      severity: parsed.data.severity as never,
    });
    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : "Failed to raise issue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
