import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { credentials, projects } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { encryptSecret, hasCredentialsKey } from "@/lib/crypto";
import { recordEvent } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  label: z.string().min(1).max(255),
  secret: z.string().max(4000).optional(),
  note: z.string().max(1000).optional(),
});

// Create a credential: either provide a login (encrypted) or request one.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const staff = user.role === "admin" || user.role === "team";
    if (!staff && project.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const provide = Boolean(parsed.data.secret?.trim());
    if (provide && !hasCredentialsKey()) {
      return NextResponse.json({ error: "Secret storage isn't configured (CREDENTIALS_KEY)." }, { status: 503 });
    }

    await db.insert(credentials).values({
      projectId: id,
      label: parsed.data.label,
      note: parsed.data.note ?? null,
      status: provide ? "provided" : "requested",
      secret: provide ? encryptSecret(parsed.data.secret!.trim()) : null,
      createdBy: user.id,
    });

    await recordEvent({
      projectId: id,
      actorId: user.id,
      kind: provide ? "credential_provided" : "credential_requested",
      summary: `${provide ? "Provided" : "Requested"} credential: ${parsed.data.label}`,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
