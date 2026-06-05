"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

/** Admin/team header action: flip into the client experience. */
export function ViewAsToggle() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function enter() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/view-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true }),
      });
      if (!res.ok) {
        toast.error("Couldn't switch view");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Couldn't switch view", "Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={enter}
      disabled={busy}
      title="Experience the app as a client"
      className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 sm:inline-flex"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
      View as client
    </button>
  );
}
