import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { updateIssue, SEVERITIES, STATUSES } from "@/lib/issues";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(STATUSES as [string, ...string[]]).optional(),
  severity: z.enum(SEVERITIES as [string, ...string[]]).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  resolution: z.string().max(4000).nullable().optional(),
});

// Staff triage / resolve an issue.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin" && user.role !== "team") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const updated = await updateIssue(
      id,
      {
        status: parsed.data.status as never,
        severity: parsed.data.severity as never,
        assigneeId: parsed.data.assigneeId,
        resolution: parsed.data.resolution,
      },
      user.id
    );
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
