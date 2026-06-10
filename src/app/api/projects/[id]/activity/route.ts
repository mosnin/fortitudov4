import { NextResponse } from "next/server";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { getActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    await verifyProjectAccess(id, user.id, user.role);

    const events = await getActivity(id, 100);
    return NextResponse.json(events);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
