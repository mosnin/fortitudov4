import { NextResponse } from "next/server";
import { db } from "@/db";
import { blueprints } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const [blueprint] = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.id, id));

    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    const project = await verifyProjectAccess(blueprint.projectId, user.id, user.role);

    return NextResponse.json({ blueprint, project });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Blueprint fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch blueprint" }, { status: 500 });
  }
}
