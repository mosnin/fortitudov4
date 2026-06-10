import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Notification } from "@/db/schema";

type NotificationType = Notification["type"];

interface NotifyArgs {
  userId: string;
  projectId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  actionUrl?: string;
}

// Single place to alert a client: writes the in-app notification and, when an
// email provider is configured, sends an email too. The in-app write is the
// source of truth; email is best-effort and never blocks.
export async function notify(args: NotifyArgs): Promise<void> {
  await db.insert(notifications).values({
    userId: args.userId,
    projectId: args.projectId,
    type: args.type,
    title: args.title,
    body: args.body,
    actionUrl: args.actionUrl,
  });

  // Best-effort email. Requires RESEND_API_KEY + NOTIFY_FROM_EMAIL.
  void sendEmail(args).catch((err) => {
    console.error("notify: email failed", err instanceof Error ? err.message : err);
  });
}

/**
 * Alert every admin (optionally excluding one — e.g. the person who triggered
 * the action). Used for agent activity that a human reviewer should see.
 */
export async function notifyAdmins(
  args: Omit<NotifyArgs, "userId">,
  exceptUserId?: string
): Promise<void> {
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  await Promise.all(
    admins
      .filter((a) => a.id !== exceptUserId)
      .map((a) => notify({ ...args, userId: a.id }))
  );
}

async function sendEmail(args: NotifyArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;
  if (!apiKey || !from) return; // email not configured — in-app only

  const [user] = await db
    .select({ email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.id, args.userId));
  if (!user?.email) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const link = args.actionUrl ? `${appUrl}${args.actionUrl}` : appUrl;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: user.email,
      subject: args.title,
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto">
          <p style="font-size:16px;color:#1C1C1C">${escapeHtml(args.title)}</p>
          ${args.body ? `<p style="font-size:14px;color:#525252">${escapeHtml(args.body)}</p>` : ""}
          ${link ? `<a href="${escapeHtml(link)}" style="display:inline-block;margin-top:12px;background:#F97316;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-size:14px">Open in Fortitudo</a>` : ""}
        </div>
      `,
    }),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
