/**
 * Client CRM pipeline model — the delivery stages every engagement walks, and
 * the default kickoff checklist auto-generated for a new client. Shared by the
 * API (task generation, stage auto-progression) and the Client CRM UI (board
 * columns, labels).
 *
 * Tasks are created UNASSIGNED — a human picks the owner. There is no built-in
 * staff roster and no department routing.
 */

export const CRM_STAGES = [
  "onboarding",
  "discovery",
  "design",
  "build",
  "client_review",
  "launched",
  "retained",
] as const;

export type CrmStage = (typeof CRM_STAGES)[number];

export const STAGE_LABELS: Record<CrmStage, string> = {
  onboarding: "Onboarding",
  discovery: "Discovery",
  design: "Design",
  build: "Build",
  client_review: "Client review",
  launched: "Launched",
  retained: "Ongoing",
};

export type TaskPriority = "low" | "medium" | "high";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/**
 * The offering a client bought — mirrors lib/services.ts. "custom" reveals a
 * free-text label input for bespoke engagements.
 *
 * These were `CLIENT_PACKAGES` / `PACKAGE_LABELS` / `ClientPackage` until the
 * screens started contradicting themselves: three admin modals labelled the
 * field "Package" above a dropdown whose own placeholder said "Select
 * offering". AGENTS.md's word is OFFERINGS, and "package" is the
 * GoHighLevel-era vocabulary this codebase has been removing everywhere else.
 *
 * The DATABASE column is still `package`, and the enum is still
 * `client_package`. Renaming those needs a migration against a live table for
 * no behavioural gain, so the column keeps its name and the code stops
 * repeating it. If a migration is ever run for another reason, rename it then.
 */
export const CLIENT_OFFERINGS = [
  "websites",
  "software_solutions",
  "ai_solutions",
  "consultation",
  "digital_marketing",
  "custom",
] as const;

export type ClientOffering = (typeof CLIENT_OFFERINGS)[number];

export const OFFERING_LABELS: Record<ClientOffering, string> = {
  websites: "Websites",
  software_solutions: "Software Solutions",
  ai_solutions: "AI Solutions",
  consultation: "Consultation",
  digital_marketing: "Digital Marketing",
  custom: "Custom",
};

/**
 * The default kickoff checklist auto-created with every new client. Steps
 * carry a stage (so completing them advances the pipeline) and a priority,
 * but never an assignee — staff claim their own work.
 */
export const DEFAULT_TASKS: {
  title: string;
  stage: CrmStage;
  priority: TaskPriority;
}[] = [
  { title: "Kickoff call scheduled", stage: "onboarding", priority: "high" },
  { title: "Access & assets collected", stage: "onboarding", priority: "high" },
  { title: "Contract & deposit confirmed", stage: "onboarding", priority: "high" },
  { title: "Requirements documented", stage: "discovery", priority: "high" },
  { title: "Scope & fixed quote approved", stage: "discovery", priority: "high" },
  { title: "Design direction approved", stage: "design", priority: "high" },
  { title: "Build environment set up", stage: "build", priority: "medium" },
  { title: "Core build complete", stage: "build", priority: "high" },
  { title: "QA & testing pass", stage: "build", priority: "high" },
  { title: "Client review round", stage: "client_review", priority: "high" },
  { title: "Revisions complete", stage: "client_review", priority: "high" },
  { title: "Launch checklist complete", stage: "launched", priority: "high" },
  { title: "Handover & credentials delivered", stage: "launched", priority: "high" },
];

export const INDUSTRIES = [
  "SaaS",
  "Ecommerce",
  "Professional services",
  "Health & wellness",
  "Hospitality",
  "Real estate",
  "Nonprofit",
  "Custom",
];

/**
 * Given the client's tasks (in pipeline order) return the stage the client
 * should now sit at: the stage of the first not-yet-completed task, or the
 * final stage once everything is done.
 */
export function stageFromTasks(
  tasks: { stage: string | null; status: string; order: number }[]
): CrmStage | null {
  const ordered = [...tasks]
    .filter((t) => t.stage && CRM_STAGES.includes(t.stage as CrmStage))
    .sort((a, b) => a.order - b.order);
  // No stage-bearing tasks (all custom, or the checklist was cleared) tells
  // us nothing — returning the final stage here would falsely mark a brand
  // new client "Launched". Callers keep the persisted stage instead.
  if (ordered.length === 0) return null;
  const nextIncomplete = ordered.find((t) => t.status !== "completed");
  if (nextIncomplete) return nextIncomplete.stage as CrmStage;
  return CRM_STAGES[CRM_STAGES.length - 1];
}
