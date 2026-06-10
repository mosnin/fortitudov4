import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { VIEW_AS_COOKIE } from "@/lib/view-as";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Toggle "view as client" mode. Only staff can turn it on; anyone can turn it
// off. Stored as a per-browser cookie — it never touches the user's real role.
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = (await req.json().catch(() => ({}))) as { enabled?: boolean };
    const enable = body?.enabled === true;

    if (enable && user.role !== "admin" && user.role !== "team") {
      return NextResponse.json({ error: "Staff only" }, { status: 403 });
    }

    const res = NextResponse.json({ ok: true, viewingAsClient: enable });
    if (enable) {
      res.cookies.set(VIEW_AS_COOKIE, "client", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 8, // 8h working session
      });
    } else {
      res.cookies.delete(VIEW_AS_COOKIE);
    }
    return res;
  } catch (error) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
