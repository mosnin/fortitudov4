import "server-only";
import { getTaskGraph, getProjectProgress, type GraphTask } from "./tasks";
import { getActivity } from "./activity";

export interface DigestRisk {
  label: string;
  detail: string;
}

export interface DigestNextAction {
  label: string;
}

export interface DeliveryDigest {
  headline: string;
  progressPct: number;
  velocity: string;
  risks: DigestRisk[];
  nextActions: DigestNextAction[];
}

const DAY_MS = 86_400_000;
// A build with no logged activity for this long reads as stalled.
const STALE_DAYS = 5;
// Too many things waiting on a human review is a flow risk worth surfacing.
const REVIEW_PILEUP = 3;

function shortTitle(t: GraphTask, max = 60): string {
  const title = t.title.trim();
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

/**
 * A deterministic "delivery lead" read of a build: where it stands, how fast
 * it's moving, what's at risk, and what to do next. Derived purely from the
 * task graph, progress rollup, and the activity timeline — no external
 * services required. Always returns a complete digest.
 */
export async function computeDigest(projectId: string): Promise<DeliveryDigest> {
  const [graph, progress, activity] = await Promise.all([
    getTaskGraph(projectId),
    getProjectProgress(projectId),
    getActivity(projectId, 50),
  ]);

  const progressPct = progress.overall.pct;
  const total = progress.overall.total;
  const done = progress.overall.done;

  const open = graph.filter((t) => t.status !== "done");
  const inReview = graph.filter((t) => t.status === "in_review");
  const inProgress = graph.filter((t) => t.status === "in_progress");
  const blocked = open.filter((t) => !t.ready);
  const ready = open.filter((t) => t.ready && t.status === "todo");

  // Recency of the freshest logged event drives the velocity read.
  const latest = activity[0]?.createdAt ? new Date(activity[0].createdAt).getTime() : null;
  const daysSinceActivity = latest === null ? null : Math.floor((Date.now() - latest) / DAY_MS);
  const recentEvents = activity.filter(
    (e) => Date.now() - new Date(e.createdAt).getTime() < 7 * DAY_MS
  ).length;

  // --- Velocity ----------------------------------------------------------
  let velocity: string;
  if (total === 0) {
    velocity = "No plan yet — awaiting a Blueprint to decompose.";
  } else if (progressPct >= 100) {
    velocity = "Build complete — all tasks shipped.";
  } else if (daysSinceActivity !== null && daysSinceActivity >= STALE_DAYS) {
    velocity = `Quiet — no activity in ${daysSinceActivity} day${daysSinceActivity === 1 ? "" : "s"}.`;
  } else if (inProgress.length > 0 || recentEvents >= 3) {
    velocity = `Moving — ${inProgress.length} in progress, ${recentEvents} update${
      recentEvents === 1 ? "" : "s"
    } this week.`;
  } else if (ready.length > 0) {
    velocity = `Ready to move — ${ready.length} task${ready.length === 1 ? "" : "s"} unblocked and waiting.`;
  } else {
    velocity = "Steady — work is queued behind dependencies.";
  }

  // --- Risks -------------------------------------------------------------
  const risks: DigestRisk[] = [];

  if (blocked.length > 0) {
    const sample = blocked
      .slice(0, 3)
      .map((t) => shortTitle(t, 40))
      .join(", ");
    risks.push({
      label: `${blocked.length} blocked`,
      detail:
        blocked.length === 1
          ? `${sample} is waiting on upstream work.`
          : `${blocked.length} tasks waiting on upstream work (${sample}).`,
    });
  }

  if (daysSinceActivity !== null && daysSinceActivity >= STALE_DAYS && progressPct < 100) {
    risks.push({
      label: "Stalled",
      detail: `No logged activity in ${daysSinceActivity} days — the build may need a nudge.`,
    });
  }

  if (inReview.length >= REVIEW_PILEUP) {
    risks.push({
      label: `${inReview.length} awaiting review`,
      detail: "Several deliverables are queued for approval — review to keep momentum.",
    });
  }

  if (total === 0) {
    risks.push({
      label: "No plan",
      detail: "This build has no task graph yet. Decompose its Blueprint to begin.",
    });
  }

  // --- Next actions ------------------------------------------------------
  const nextActions: DigestNextAction[] = [];

  // Reviews first — they unblock the most downstream work per unit of effort.
  for (const t of inReview.slice(0, 2)) {
    nextActions.push({ label: `Review: ${shortTitle(t)}` });
  }
  for (const t of ready.slice(0, 4 - nextActions.length)) {
    nextActions.push({ label: `Start: ${shortTitle(t)}` });
  }
  // Fall back to whatever is in flight so the list is never empty mid-build.
  if (nextActions.length === 0) {
    for (const t of inProgress.slice(0, 3)) {
      nextActions.push({ label: `Finish: ${shortTitle(t)}` });
    }
  }

  // --- Headline ----------------------------------------------------------
  let headline: string;
  if (total === 0) {
    headline = "Ready to plan this build.";
  } else if (progressPct >= 100) {
    headline = "Build complete — every task is shipped.";
  } else if (blocked.length > 0 && ready.length === 0 && inProgress.length === 0) {
    headline = `Stuck — ${blocked.length} task${blocked.length === 1 ? "" : "s"} blocked, nothing ready to start.`;
  } else if (inReview.length >= REVIEW_PILEUP) {
    headline = `${done} of ${total} done — ${inReview.length} deliverables need your review.`;
  } else {
    headline = `${done} of ${total} tasks done (${progressPct}%), ${ready.length + inProgress.length} actionable now.`;
  }

  const digest: DeliveryDigest = { headline, progressPct, velocity, risks, nextActions };

  // Optional polish: rewrite the headline more naturally when a key is set.
  // The deterministic digest above is always the source of truth — this only
  // ever swaps the headline string, and silently no-ops on any failure.
  if (process.env.OPENAI_API_KEY) {
    const polished = await rewriteHeadline(digest);
    if (polished) digest.headline = polished;
  }

  return digest;
}

/**
 * Best-effort natural-language rewrite of the headline via the OpenAI Agents
 * SDK. Gated on OPENAI_API_KEY (mirrors src/lib/decompose.ts) and fully
 * optional — any error returns null and the deterministic headline stands.
 */
async function rewriteHeadline(digest: DeliveryDigest): Promise<string | null> {
  try {
    const { Agent, run, setDefaultOpenAIKey } = await import("@openai/agents");
    setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

    const agent = new Agent({
      name: "Fortitudo Delivery Lead",
      instructions:
        "You are Fortitudo's calm, confident delivery lead. Rewrite the build status into ONE crisp sentence (max ~16 words) a client would read at a glance. Keep every fact unchanged — same numbers, same meaning. No emoji, no hype, no preamble. Return only the sentence.",
      model: process.env.OPENAI_BRIEF_MODEL ?? "gpt-5.5",
    });

    const context = [
      `Current headline: ${digest.headline}`,
      `Progress: ${digest.progressPct}%`,
      `Velocity: ${digest.velocity}`,
      digest.risks.length ? `Risks: ${digest.risks.map((r) => r.label).join("; ")}` : "Risks: none",
    ].join("\n");

    const result = await run(agent, context);
    const text = typeof result.finalOutput === "string" ? result.finalOutput.trim() : "";
    return text ? text.replace(/^["']|["']$/g, "") : null;
  } catch (err) {
    console.error("rewriteHeadline failed", err instanceof Error ? err.message : err);
    return null;
  }
}
