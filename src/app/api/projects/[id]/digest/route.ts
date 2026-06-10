import { NextResponse } from "next/server";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { computeDigest } from "@/lib/delivery-lead";

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

    const digest = await computeDigest(id);
    return NextResponse.json(digest);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Digest error:", error);
    return NextResponse.json({ error: "Failed to compute digest" }, { status: 500 });
  }
}
