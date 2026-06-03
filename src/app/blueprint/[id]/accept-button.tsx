"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export function AcceptBlueprintButton({
  blueprintId,
  projectId,
}: {
  blueprintId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blueprints/${blueprintId}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept");
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // No payment provider configured — go straight to the Studio.
        router.push(`/projects/${projectId}`);
      }
    } catch {
      setError("Couldn't accept the Blueprint. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="glow" size="lg" className="w-full" onClick={accept} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
        Accept &amp; start the build
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
