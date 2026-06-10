import { NextResponse } from "next/server";
import { db } from "@/db";
import { blueprints } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { acceptBlueprint } from "@/lib/studio";
import { recordEvent } from "@/lib/activity";

// Accept a Blueprint -> mark accepted, create a pending payment, and return a
// checkout URL for the real total.
export async function POST(
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

    await verifyProjectAccess(blueprint.projectId, user.id, user.role);

    const result = await acceptBlueprint(id, user.id);
    if (!result) {
      return NextResponse.json(
        { error: "Blueprint cannot be accepted (already accepted or missing)." },
        { status: 409 }
      );
    }

    await recordEvent({
      projectId: blueprint.projectId,
      actorId: user.id,
      kind: "blueprint_accepted",
      summary: `Blueprint "${blueprint.title}" accepted — the build is a go`,
    });

    const checkoutBase = process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;
    const checkoutUrl = checkoutBase
      ? `${checkoutBase}?metadata[projectId]=${blueprint.projectId}&metadata[paymentId]=${result.paymentId}`
      : null;

    return NextResponse.json({
      projectId: blueprint.projectId,
      paymentId: result.paymentId,
      total: blueprint.total,
      currency: blueprint.currency,
      checkoutUrl,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Blueprint accept error:", error);
    return NextResponse.json({ error: "Failed to accept blueprint" }, { status: 500 });
  }
}
