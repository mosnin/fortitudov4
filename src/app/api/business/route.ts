import { NextResponse } from "next/server";
import { db } from "@/db";
import { businessProfiles } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  industry: z.string().max(255).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  targetMarket: z.string().max(2000).optional(),
  stage: z.enum(["idea", "early", "growing", "established"]).optional(),
  teamSize: z.string().max(50).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const v = parsed.data;

    const values = {
      name: v.name,
      description: v.description,
      industry: v.industry || null,
      website: v.website || null,
      targetMarket: v.targetMarket || null,
      stage: v.stage ?? null,
      teamSize: v.teamSize || null,
    };

    await db
      .insert(businessProfiles)
      .values({ userId: user.id, ...values })
      .onConflictDoUpdate({
        target: businessProfiles.userId,
        set: { ...values, updatedAt: new Date() },
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Business profile error:", error);
    return NextResponse.json({ error: "Failed to save business profile" }, { status: 500 });
  }
}
