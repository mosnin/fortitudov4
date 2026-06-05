import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { inviteTeamMember } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().max(255),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
});

// Admin-only: invite (or promote) a team member by email.
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });

    const result = await inviteTeamMember(parsed.data);
    return NextResponse.json({
      ok: true,
      isNew: result.isNew,
      alreadyStaff: result.alreadyStaff,
      email: result.user.email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to invite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
