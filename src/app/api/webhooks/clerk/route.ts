import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  // In production, verify the webhook signature with Clerk's webhook secret
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "user.created") {
      await db.insert(users).values({
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address ?? "",
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
        role: "client",
      });
    }

    if (type === "user.updated") {
      await db
        .update(users)
        .set({
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, data.id));
    }

    if (type === "user.deleted") {
      await db.delete(users).where(eq(users.clerkId, data.id));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
