"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Loader2, ShieldQuestion } from "lucide-react";

export interface DecisionItem {
  id: string;
  kind: "info" | "asset" | "credential" | "approval" | "choice";
  title: string;
  prompt: string;
  schema?: { options?: string[] } | Record<string, unknown> | null;
}

const kindLabel: Record<DecisionItem["kind"], string> = {
  info: "Information needed",
  asset: "Asset needed",
  credential: "Credential needed",
  approval: "Approval needed",
  choice: "Decision needed",
};

function DecisionCard({ decision }: { decision: DecisionItem }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (response: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/decisions/${decision.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setError("Couldn't submit. Please try again.");
      setLoading(false);
    }
  };

  const options =
    decision.schema && "options" in decision.schema
      ? (decision.schema.options as string[] | undefined)
      : undefined;

  return (
    <div className="rounded-xl border border-orange/30 bg-orange/[0.03] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="orange" className="text-[10px]">{kindLabel[decision.kind]}</Badge>
      </div>
      <p className="font-semibold text-sm">{decision.title}</p>
      <p className="text-sm text-muted-foreground mt-1">{decision.prompt}</p>

      <div className="mt-3 space-y-2">
        {decision.kind === "choice" && options ? (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <Button key={opt} size="sm" variant="outline" disabled={loading} onClick={() => submit({ choice: opt })}>
                {opt}
              </Button>
            ))}
          </div>
        ) : decision.kind === "approval" ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="glow" disabled={loading} onClick={() => submit({ approved: true })}>
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => submit({ approved: false, note: text })}>
              Request changes
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {decision.kind === "credential" ? (
              <Input type="password" placeholder="Paste the value securely" value={text} onChange={(e) => setText(e.target.value)} />
            ) : (
              <Textarea rows={2} placeholder="Your answer..." value={text} onChange={(e) => setText(e.target.value)} />
            )}
            <Button size="sm" variant="glow" className="self-start" disabled={loading || !text.trim()} onClick={() => submit({ value: text })}>
              {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
              Submit
            </Button>
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}

export function DecisionLoop({ decisions }: { decisions: DecisionItem[] }) {
  if (decisions.length === 0) {
    return (
      <div id="decisions" className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
          <Check className="h-5 w-5 text-success" />
        </div>
        <div>
          <p className="font-medium text-sm">Nothing needs your attention</p>
          <p className="text-xs text-muted-foreground">Your build is progressing. We&apos;ll reach out only when a decision is needed.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="decisions" className="rounded-2xl border border-orange/30 bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldQuestion className="h-5 w-5 text-orange" />
        <h2 className="font-semibold">We need {decisions.length} thing{decisions.length > 1 ? "s" : ""} from you</h2>
        <Bell className="h-4 w-4 text-orange ml-auto" />
      </div>
      <div className="space-y-3">
        {decisions.map((d) => (
          <DecisionCard key={d.id} decision={d} />
        ))}
      </div>
    </div>
  );
}
