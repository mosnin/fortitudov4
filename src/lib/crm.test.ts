/**
 * The delivery pipeline.
 *
 * AGENTS.md states the pipeline in prose — Onboarding → Discovery → Design →
 * Build → Client review → Launched → Ongoing — and three places have to agree
 * with it: the `CRM_STAGES` tuple, the labels the board renders, and the
 * `crm_stage` Postgres enum. Nothing enforces that today; a stage inserted in
 * the middle of one list and appended to another would still typecheck, and
 * would silently move every client's derived stage by one column.
 *
 * `stageFromTasks` is the other half: it is what auto-advances a client when a
 * checklist item is ticked, so its edge cases (nothing to go on, unknown
 * stages, out-of-order rows) decide whether a brand-new client can be marked
 * "Launched" by accident.
 */

import { describe, expect, it } from "vitest";
import {
  CLIENT_PACKAGES,
  CRM_STAGES,
  DEFAULT_TASKS,
  PACKAGE_LABELS,
  PRIORITY_LABELS,
  STAGE_LABELS,
  stageFromTasks,
  type CrmStage,
} from "./crm";
import { clientPackageEnum, crmStageEnum } from "@/db/schema";
import { SERVICE_LABELS, services } from "./services";

describe("pipeline definition", () => {
  it("is exactly the pipeline AGENTS.md documents, in order", () => {
    expect([...CRM_STAGES]).toEqual([
      "onboarding",
      "discovery",
      "design",
      "build",
      "client_review",
      "launched",
      "retained",
    ]);
  });

  it("renders the labels AGENTS.md documents, in order", () => {
    expect(CRM_STAGES.map((stage) => STAGE_LABELS[stage])).toEqual([
      "Onboarding",
      "Discovery",
      "Design",
      "Build",
      "Client review",
      "Launched",
      "Ongoing",
    ]);
  });

  it("labels every stage and no stage that does not exist", () => {
    expect(Object.keys(STAGE_LABELS).sort()).toEqual([...CRM_STAGES].sort());
  });

  it("matches the crm_stage database enum exactly, order included", () => {
    // Order matters twice over: the board renders columns in this order and
    // stage auto-progression walks it top to bottom.
    expect([...crmStageEnum.enumValues]).toEqual([...CRM_STAGES]);
  });

  it("names each stage once", () => {
    expect(new Set(CRM_STAGES).size).toBe(CRM_STAGES.length);
  });
});

describe("client packages", () => {
  it("is the five offerings plus custom, and nothing else", () => {
    expect([...CLIENT_PACKAGES]).toEqual([
      "websites",
      "software_solutions",
      "ai_solutions",
      "consultation",
      "digital_marketing",
      "custom",
    ]);
  });

  it("matches the client_package database enum", () => {
    expect([...clientPackageEnum.enumValues]).toEqual([...CLIENT_PACKAGES]);
  });

  it("labels each package the same way lib/services.ts does", () => {
    for (const service of services) {
      expect(PACKAGE_LABELS[service.id]).toBe(SERVICE_LABELS[service.id]);
    }
    expect(PACKAGE_LABELS.custom).toBe("Custom");
  });

  it("carries none of the swept-out GHL tiers", () => {
    // AGENTS.md: no Bronze/Gold/Diamond tiers — clients carry an offering.
    for (const pkg of CLIENT_PACKAGES) {
      expect(pkg).not.toMatch(/bronze|silver|gold|diamond|platinum|tier/i);
    }
  });

  it("labels all three task priorities", () => {
    expect(PRIORITY_LABELS).toEqual({ low: "Low", medium: "Medium", high: "High" });
  });
});

describe("the default kickoff checklist", () => {
  it("only ever names stages the pipeline has", () => {
    for (const task of DEFAULT_TASKS) {
      expect(CRM_STAGES).toContain(task.stage);
    }
  });

  it("is listed in pipeline order", () => {
    // stageFromTasks derives a client's stage from the first incomplete task
    // in `order`, and the seeder writes these in array order — so a checklist
    // that jumped backwards would walk a client back up the board.
    const positions = DEFAULT_TASKS.map((task) => CRM_STAGES.indexOf(task.stage));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("starts in onboarding", () => {
    expect(DEFAULT_TASKS[0].stage).toBe("onboarding");
  });

  it("seeds no assignee — staff claim their own work", () => {
    for (const task of DEFAULT_TASKS) {
      expect(task).not.toHaveProperty("assigneeId");
      expect(task).not.toHaveProperty("assignee");
    }
  });

  it("gives every step a title and a known priority", () => {
    for (const task of DEFAULT_TASKS) {
      expect(task.title.trim().length).toBeGreaterThan(0);
      expect(Object.keys(PRIORITY_LABELS)).toContain(task.priority);
    }
  });

  it("names each step once", () => {
    const titles = DEFAULT_TASKS.map((task) => task.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

/** Build a checklist row of the shape stageFromTasks consumes. */
function task(
  stage: string | null,
  status: "pending" | "in_progress" | "completed",
  order: number
) {
  return { stage, status, order };
}

describe("stageFromTasks", () => {
  it("returns the stage of the first incomplete task", () => {
    expect(
      stageFromTasks([
        task("onboarding", "completed", 0),
        task("discovery", "completed", 1),
        task("design", "pending", 2),
        task("build", "pending", 3),
      ])
    ).toBe("design");
  });

  it("orders by the `order` column, not by array position", () => {
    // The API hands these over in whatever order the query returned them.
    expect(
      stageFromTasks([
        task("build", "pending", 3),
        task("discovery", "completed", 1),
        task("onboarding", "completed", 0),
        task("design", "pending", 2),
      ])
    ).toBe("design");
  });

  it("treats anything that is not 'completed' as outstanding", () => {
    expect(
      stageFromTasks([
        task("onboarding", "completed", 0),
        task("discovery", "in_progress", 1),
        task("design", "pending", 2),
      ])
    ).toBe("discovery");
  });

  it("returns the final stage once every task is done", () => {
    expect(
      stageFromTasks([
        task("onboarding", "completed", 0),
        task("launched", "completed", 1),
      ])
    ).toBe(CRM_STAGES[CRM_STAGES.length - 1]);
    expect(CRM_STAGES[CRM_STAGES.length - 1]).toBe("retained");
  });

  it("returns null rather than a stage when there is nothing to go on", () => {
    // Returning the final stage here would mark a brand new client "Launched".
    expect(stageFromTasks([])).toBeNull();
  });

  it("returns null when no task carries a stage", () => {
    expect(
      stageFromTasks([task(null, "pending", 0), task(null, "completed", 1)])
    ).toBeNull();
  });

  it("returns null when every stage on the tasks is unrecognised", () => {
    expect(
      stageFromTasks([
        task("qualified", "pending", 0),
        task("Onboarding", "pending", 1), // wrong case is not a stage
      ])
    ).toBeNull();
  });

  it("ignores stage-less and unrecognised tasks when deciding", () => {
    expect(
      stageFromTasks([
        task(null, "pending", 0),
        task("archived", "pending", 1),
        task("onboarding", "completed", 2),
        task("build", "pending", 3),
      ])
    ).toBe("build");
  });

  it("does not let a stage-less incomplete task hold a client back", () => {
    expect(
      stageFromTasks([
        task("onboarding", "completed", 0),
        task(null, "pending", 1),
        task("discovery", "completed", 2),
      ])
    ).toBe("retained");
  });

  it("copes with negative and duplicated order values", () => {
    expect(
      stageFromTasks([
        task("design", "pending", 5),
        task("onboarding", "completed", -2),
        task("discovery", "pending", 5),
      ])
    ).toBe("design");
  });

  it("does not mutate the array it was given", () => {
    const tasks = [
      task("build", "pending", 3),
      task("onboarding", "completed", 0),
    ];
    const snapshot = [...tasks];

    stageFromTasks(tasks);

    expect(tasks).toEqual(snapshot);
  });

  it("walks the real checklist one stage at a time", () => {
    // Tick the seeded checklist off in order; the derived stage should march
    // forward through the pipeline and never backwards.
    const rows = DEFAULT_TASKS.map((t, order) => ({
      stage: t.stage as string,
      status: "pending" as "pending" | "completed",
      order,
    }));

    const seen: CrmStage[] = [];
    for (let i = 0; i <= rows.length; i += 1) {
      const derived = stageFromTasks(rows);
      expect(derived).not.toBeNull();
      seen.push(derived as CrmStage);
      if (i < rows.length) rows[i].status = "completed";
    }

    const positions = seen.map((stage) => CRM_STAGES.indexOf(stage));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(seen[0]).toBe("onboarding");
    expect(seen[seen.length - 1]).toBe("retained");
  });

  it("stays put while the current stage still has outstanding work", () => {
    const rows = DEFAULT_TASKS.map((t, order) => ({
      stage: t.stage as string,
      status: (t.stage === "onboarding" && order === 0 ? "completed" : "pending") as
        | "pending"
        | "completed",
      order,
    }));

    // Two onboarding items remain, so the client is still onboarding.
    expect(stageFromTasks(rows)).toBe("onboarding");
  });
});
