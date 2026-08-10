"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/ui/firecrawl";
import { TableSkeleton } from "@/components/ui/skeleton";
import { rowCascade, rowItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  CAPTION,
  GHOST_PILL,
  H1,
  H3,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
  TITLE_FONT,
} from "@/lib/typography";
import { X } from "lucide-react";
import { ROLE_LABELS } from "@/lib/permissions";
import type { UserRole } from "@/db/schema";

interface TeamUser {
  id: string;
  /** Real accounts carry a Clerk id; invited-but-not-signed-up members carry
   * the `invite:<email>` placeholder the API seeds them with. */
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

const roleOptions: UserRole[] = ["admin", "project_manager", "va", "client"];

const selectClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40";

export default function AdminTeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "project_manager" as UserRole,
  });

  const fetchTeam = () => {
    fetch("/api/team?includeClients=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const updateRole = async (userId: string, role: UserRole) => {
    setUpdating(userId);
    setError(null);
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update role");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdating(null);
    }
  };

  function openAdd() {
    setEditing(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "project_manager",
    });
    setNotice(null);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(u: TeamUser) {
    setEditing(u);
    setForm({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email,
      role: u.role,
    });
    setNotice(null);
    setError(null);
    setModalOpen(true);
  }

  async function saveMember(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!form.firstName.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim(),
        role: form.role,
      };
      const res = editing
        ? await fetch("/api/team", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: editing.id,
              ...body,
              resendInvite: editing.email !== form.email.trim().toLowerCase(),
            }),
          })
        : await fetch("/api/team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save");
      fetchTeam();
      if (data.inviteStatus === "sent") {
        setNotice("Invite email sent.");
        setModalOpen(false);
      } else if (data.inviteStatus === "failed") {
        setNotice(
          "Saved, but the invite email could not be sent — check Clerk config."
        );
      } else {
        setModalOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(u: TeamUser) {
    const label = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
    if (
      !window.confirm(
        `Remove ${label} from the team? Their checklist assignments keep their name; their login is revoked.`
      )
    )
      return;
    setUpdating(u.id);
    setNotice(null);
    try {
      const res = await fetch("/api/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setNotice(
        data?.clerkStatus === "failed"
          ? `${label} removed — revoke their login in Clerk manually.`
          : `${label} removed from the team.`
      );
      fetchTeam();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message !== "failed"
          ? err.message
          : "Could not remove the team member — try again."
      );
    } finally {
      setUpdating(null);
    }
  }

  async function resendInvite(u: TeamUser) {
    setUpdating(u.id);
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, resendInvite: true }),
      });
      const data = await res.json().catch(() => ({}));
      setNotice(
        data.inviteStatus === "sent"
          ? `Invite re-sent to ${u.email}.`
          : "Could not send the invite — check Clerk config."
      );
    } finally {
      setUpdating(null);
    }
  }

  const staff = users.filter((u) => u.role !== "client");

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Operations"
          title="Team"
          description="Manage staff access. Add a team member to send them a portal invite — they become assignable across the CRM instantly."
          action={
            <button onClick={openAdd} className={PRIMARY_PILL}>
              Add Team Member
            </button>
          }
        />

        {notice && (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm text-foreground">
            {notice}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Staff members */}
        <section className={SECTION_RHYTHM}>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className={H3}>Staff Members</h2>
            <p className={SECTION_LABEL}>{staff.length} staff</p>
          </div>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : staff.length === 0 ? (
            <div className="py-14 text-center">
              <h3 className={H3}>No staff members yet</h3>
              <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
                Add a team member to send them a portal invite and start
                assigning work.
              </p>
            </div>
          ) : (
            <motion.ul
              variants={rowCascade}
              initial="hidden"
              animate="visible"
              className="divide-y divide-border/60"
            >
              {staff.map((member) => {
                const pending = member.clerkId?.startsWith("invite:") ?? false;
                const name =
                  [member.firstName, member.lastName]
                    .filter(Boolean)
                    .join(" ") || "—";
                return (
                  <motion.li
                    key={member.id}
                    variants={rowItem}
                    className="group/row -mx-2 flex flex-wrap items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {name}
                        </span>
                        {pending && (
                          <span className={STATUS_PILL}>Invited</span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <select
                        aria-label={`Role for ${name}`}
                        className="cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground transition-colors hover:border-foreground/25 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={member.role}
                        disabled={updating === member.id}
                        onChange={(e) =>
                          updateRole(member.id, e.target.value as UserRole)
                        }
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => resendInvite(member)}
                        disabled={updating === member.id}
                        className={cn(
                          QUIET_LINK,
                          "cursor-pointer disabled:opacity-50"
                        )}
                      >
                        Resend invite
                      </button>
                      <button
                        onClick={() => openEdit(member)}
                        className={cn(QUIET_LINK, "cursor-pointer")}
                      >
                        Edit
                      </button>
                      {member.role !== "admin" && (
                        <button
                          onClick={() => removeMember(member)}
                          disabled={updating === member.id}
                          className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                          aria-label={`Remove ${member.firstName ?? member.email}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </section>
      </div>

      {/* Add / edit member modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.form
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onSubmit={saveMember}
              className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(15,16,16,0.06),0_24px_60px_-16px_rgba(15,16,16,0.3)] sm:p-8"
            >
              <div className="flex items-start justify-between pb-6">
                <h2 className={cn(H1, "text-2xl")} style={TITLE_FONT}>
                  {editing ? "Edit Team Member" : "Add Team Member"}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1.5 block text-[13px] font-medium">
                      First Name
                    </span>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      placeholder="Alex"
                    />
                  </div>
                  <div>
                    <span className="mb-1.5 block text-[13px] font-medium">
                      Last Name
                    </span>
                    <Input
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Email
                  </span>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="teammate@example.com"
                  />
                  <p className={cn(CAPTION, "mt-1.5")}>
                    We&apos;ll email them a secure invite to set their password.
                  </p>
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Role
                  </span>
                  <select
                    className={selectClass}
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as UserRole })
                    }
                  >
                    {(["project_manager", "va", "admin"] as UserRole[]).map(
                      (r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      )
                    )}
                  </select>
                  <p className={cn(CAPTION, "mt-1.5")}>
                    Roles set what they can see — access is per-role, not
                    per-team.
                  </p>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {notice && (
                  <p className="text-sm text-muted-foreground">{notice}</p>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-2 border-t border-border pt-5">
                <button
                  type="button"
                  className={GHOST_PILL}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cn(PRIMARY_PILL, "disabled:opacity-50")}
                  disabled={saving}
                >
                  {saving ? "Saving…" : editing ? "Save" : "Add & Invite"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
