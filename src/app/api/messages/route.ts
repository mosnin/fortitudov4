import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, projects, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";
import { recordEvent } from "@/lib/activity";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    await verifyProjectAccess(projectId, user.id, user.role);

    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10) || 100, 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    const projectMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(projectMessages);
  } catch (error) {
    console.error("Messages error:", error);
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

const postMessageSchema = z.object({
  projectId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

// Notify the *other* party that a message landed: a client's message pings the
// admins; an agency message pings the client who owns the build. In-app
// notification (+ best-effort email) — the bell already renders these.
async function notifyRecipients(args: {
  projectId: string;
  senderId: string;
  isStaff: boolean;
  content: string;
}): Promise<void> {
  const [project] = await db
    .select({ userId: projects.userId, name: projects.name })
    .from(projects)
    .where(eq(projects.id, args.projectId));
  if (!project) return;

  const preview = args.content.length > 140 ? `${args.content.slice(0, 137)}…` : args.content;
  const buildName = project.name || "your build";

  if (args.isStaff) {
    // Agency → the client who owns this build.
    if (project.userId && project.userId !== args.senderId) {
      await notify({
        userId: project.userId,
        projectId: args.projectId,
        type: "message_received",
        title: `New message about ${buildName}`,
        body: preview,
        actionUrl: `/messages?project=${args.projectId}`,
      });
    }
  } else {
    // Client → every admin (small team; keeps it simple and reliable).
    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    await Promise.all(
      admins
        .filter((a) => a.id !== args.senderId)
        .map((a) =>
          notify({
            userId: a.id,
            projectId: args.projectId,
            type: "message_received",
            title: `New client message · ${buildName}`,
            body: preview,
            actionUrl: `/admin/messages?project=${args.projectId}`,
          })
        )
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const parsed = postMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { projectId, content } = parsed.data;

    await verifyProjectAccess(projectId, user.id, user.role);

    const rateLimit = await checkRateLimit(user.id + ":messages", 30);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Owners and team members both speak for the agency side of the thread.
    const isStaff = user.role === "admin" || user.role === "team";

    const [message] = await db
      .insert(messages)
      .values({
        projectId,
        senderId: user.id,
        role: isStaff ? "admin" : "client",
        content,
      })
      .returning();

    // Alert the other side so a message is never sent into the void.
    void notifyRecipients({ projectId, senderId: user.id, isStaff, content }).catch((err) =>
      console.error("message notify failed", err instanceof Error ? err.message : err)
    );

    void recordEvent({
      projectId,
      actorId: user.id,
      kind: "message",
      summary: `${isStaff ? "Studio" : "Client"} sent a message`,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Message error:", error);
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
