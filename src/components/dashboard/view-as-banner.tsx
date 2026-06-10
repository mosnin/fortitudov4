"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, X, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

/** Shown while a staff member is browsing as a client. Exit returns to /admin. */
export function ViewAsBanner() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function exit() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/view-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
      if (!res.ok) {
        toast.error("Couldn't exit client view");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Couldn't exit client view", "Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 border-b border-orange/30 bg-orange/10 px-4 py-2 text-xs text-orange">
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5" />
        Viewing the app as a client.
      </span>
      <button
        onClick={exit}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-orange/40 px-2.5 py-1 font-medium transition-colors hover:bg-orange/15 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
        Exit
      </button>
    </div>
  );
}
