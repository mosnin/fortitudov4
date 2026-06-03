"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Play, ShieldQuestion, Package, Send } from "lucide-react";

interface PhaseRow {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
}
interface DecisionRow {
  id: string;
  kind: string;
  title: string;
  status: string;
}
interface DeliverableRow {
  id: string;
  kind: string;
  title: string;
  url: string | null;
}

const decisionKinds = ["info", "asset", "credential", "approval", "choice"] as const;
const deliverableKinds = ["preview", "repo", "deploy_url", "design", "document", "other"] as const;

export function AdminProjectConsole({
  projectId,
  phases,
  decisions,
  deliverables,
}: {
  projectId: string;
  phases: PhaseRow[];
  decisions: DecisionRow[];
  deliverables: DeliverableRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const setPhase = async (phaseId: string, status: "in_progress" | "completed") => {
    setBusy(true);
    try {
      await fetch(`/api/projects/${projectId}/phases`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phaseId, status }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  // --- decision form ---
  const [dKind, setDKind] = useState<(typeof decisionKinds)[number]>("info");
  const [dTitle, setDTitle] = useState("");
  const [dPrompt, setDPrompt] = useState("");
  const [dOptions, setDOptions] = useState("");

  const createDecision = async () => {
    if (!dTitle.trim() || !dPrompt.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/admin/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          kind: dKind,
          title: dTitle,
          prompt: dPrompt,
          options:
            dKind === "choice" && dOptions.trim()
              ? dOptions.split(",").map((s) => s.trim()).filter(Boolean)
              : undefined,
        }),
      });
      setDTitle("");
      setDPrompt("");
      setDOptions("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  // --- deliverable form ---
  const [vKind, setVKind] = useState<(typeof deliverableKinds)[number]>("deploy_url");
  const [vTitle, setVTitle] = useState("");
  const [vUrl, setVUrl] = useState("");

  const postDeliverable = async () => {
    if (!vTitle.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/admin/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, kind: vKind, title: vTitle, url: vUrl || undefined }),
      });
      setVTitle("");
      setVUrl("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const selectClass =
    "h-10 rounded-lg border border-border bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Build plan */}
      <Card>
        <CardHeader>
          <CardTitle>Build plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {phases.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Badge variant={p.status === "completed" ? "success" : p.status === "in_progress" ? "orange" : "secondary"}>
                  {p.status.replace("_", " ")}
                </Badge>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <div className="flex gap-1">
                {p.status === "pending" && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => setPhase(p.id, "in_progress")}>
                    <Play className="mr-1 h-3 w-3" /> Start
                  </Button>
                )}
                {p.status === "in_progress" && (
                  <Button size="sm" variant="glow" disabled={busy} onClick={() => setPhase(p.id, "completed")}>
                    <Check className="mr-1 h-3 w-3" /> Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Raise a decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldQuestion className="h-5 w-5 text-orange" /> Ask the client for something
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <select className={selectClass} value={dKind} onChange={(e) => setDKind(e.target.value as typeof dKind)}>
              {decisionKinds.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <Input placeholder="Title (e.g. Brand assets)" value={dTitle} onChange={(e) => setDTitle(e.target.value)} />
          </div>
          <Textarea rows={2} placeholder="What exactly do you need from them?" value={dPrompt} onChange={(e) => setDPrompt(e.target.value)} />
          {dKind === "choice" && (
            <Input placeholder="Options, comma-separated" value={dOptions} onChange={(e) => setDOptions(e.target.value)} />
          )}
          <Button size="sm" disabled={busy || !dTitle.trim() || !dPrompt.trim()} onClick={createDecision}>
            <Send className="mr-1 h-4 w-4" /> Send decision request
          </Button>
          {decisions.length > 0 && (
            <div className="pt-2 border-t border-border space-y-1">
              {decisions.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{d.title}</span>
                  <Badge variant={d.status === "open" ? "warning" : "success"} className="text-[10px]">{d.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post a deliverable */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange" /> Post a deliverable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select className={selectClass} value={vKind} onChange={(e) => setVKind(e.target.value as typeof vKind)}>
              {deliverableKinds.map((k) => (
                <option key={k} value={k}>{k.replace("_", " ")}</option>
              ))}
            </select>
            <Input placeholder="Title (e.g. Staging preview)" value={vTitle} onChange={(e) => setVTitle(e.target.value)} />
            <Input placeholder="https://… (optional)" value={vUrl} onChange={(e) => setVUrl(e.target.value)} />
            <Button size="sm" disabled={busy || !vTitle.trim()} onClick={postDeliverable}>
              Post
            </Button>
          </div>
          {deliverables.length > 0 && (
            <div className="pt-2 border-t border-border grid grid-cols-1 gap-1 sm:grid-cols-2">
              {deliverables.map((d) => (
                <div key={d.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-3 w-3 text-orange" />
                  <span className="truncate">{d.title}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
