"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const roles = ["client", "team", "admin"] as const;

/** Owner control to set a user's role from the Clients table. */
export function RoleSelect({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    const prev = value;
    setValue(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) {
        setValue(prev);
      } else {
        router.refresh();
      }
    } catch {
      setValue(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      className="h-8 rounded-full border border-border/60 bg-background/40 px-2.5 text-xs capitalize text-foreground focus:border-orange/50 focus:outline-none disabled:opacity-50"
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
