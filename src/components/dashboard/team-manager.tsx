"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TeamRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "team";
  pending: boolean;
  joinedAt: string;
  openTasks: number;
};

const inputCls =
  "h-10 rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none";

export function TeamManager({ rows, meId }: { rows: TeamRow[]; meId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  async function invite() {
    if (!email.trim() || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to invite.");
      setNote(
        data.alreadyStaff
          ? `${data.email} is already on the team.`
          : data.isNew
            ? `Invited ${data.email}. They join the moment they sign up with that email.`
            : `${data.email} was promoted to the team.`
      );
      setEmail("");
      setFirstName("");
      setLastName("");
      router.refresh();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Failed to invite.");
    } finally {
      setBusy(false);
    }
  }

  async function setRole(id: string, role: string) {
    setRowBusy(id);
    try {
      await fetch(`/api/admin/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  async function remove(id: string) {
    setRowBusy(id);
    try {
      await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Invite */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Invite a member</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          They join automatically when they sign up with this email — no code to share.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
          <input className={inputCls} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input className={inputCls} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input
            className={inputCls}
            placeholder="email@studio.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()}
          />
          <button
            onClick={invite}
            disabled={busy || !email.trim()}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange px-4 text-sm font-semibold text-white hover:bg-orange-dark disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Invite
          </button>
        </div>
        {note && <p className="mt-3 font-mono text-xs text-muted-foreground">{note}</p>}
      </div>

      {/* Roster */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 pb-2 pt-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Roster</span>
          <span className="h-px flex-1 bg-border/60" />
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
            {rows.length.toString().padStart(2, "0")}
          </span>
        </div>

        {rows.map((r) => {
          const isMe = r.id === meId;
          return (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 px-5 py-3.5"
            >
              {/* identity */}
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={cn("mt-1 font-mono text-xs", r.pending ? "text-muted-foreground/40" : "text-orange")}
                  title={r.pending ? "Invited — not signed in yet" : "Active"}
                  aria-hidden
                >
                  {r.pending ? "○" : "●"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {r.name}
                    {isMe && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{r.email}</p>
                </div>
              </div>

              {/* load */}
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm tabular-nums">{r.openTasks}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">open</p>
              </div>

              {/* status + role */}
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange/60">
                  {r.pending ? "invited" : "active"}
                </span>
                <select
                  value={r.role}
                  disabled={isMe || rowBusy === r.id}
                  onChange={(e) => setRole(r.id, e.target.value)}
                  className="h-8 rounded-full border border-border/60 bg-background/40 px-2 font-mono text-xs focus:outline-none disabled:opacity-50"
                  title={isMe ? "You can't change your own role" : "Change role"}
                >
                  <option value="admin">admin</option>
                  <option value="team">team</option>
                  <option value="client">remove</option>
                </select>
                {r.pending && (
                  <button
                    onClick={() => remove(r.id)}
                    disabled={rowBusy === r.id}
                    title="Revoke invite"
                    className="rounded-full border border-border/60 p-1.5 text-muted-foreground hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
                  >
                    {rowBusy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
