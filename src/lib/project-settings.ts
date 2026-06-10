import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projectSettings, type ProjectSettings } from "@/db/schema";

export type AutonomyLevel = "manual" | "assisted" | "autonomous";

export const AUTONOMY_LEVELS: AutonomyLevel[] = ["manual", "assisted", "autonomous"];

export const AUTONOMY_COPY: Record<AutonomyLevel, { label: string; detail: string }> = {
  manual: { label: "Manual", detail: "Humans do everything. Agents only assist on request." },
  assisted: { label: "Assisted", detail: "Agents draft the work; a human approves every step." },
  autonomous: { label: "Autonomous", detail: "Agents act and notify you; you can veto anything." },
};

export type Settings = {
  projectId: string;
  autonomyLevel: AutonomyLevel;
  brandColor: string | null;
  brandName: string | null;
  conciergeEnabled: boolean;
};

const DEFAULTS = (projectId: string): Settings => ({
  projectId,
  autonomyLevel: "assisted",
  brandColor: null,
  brandName: null,
  conciergeEnabled: true,
});

/** Settings for a build, falling back to sensible defaults if none are saved. */
export async function getProjectSettings(projectId: string): Promise<Settings> {
  const [row] = await db.select().from(projectSettings).where(eq(projectSettings.projectId, projectId));
  if (!row) return DEFAULTS(projectId);
  return {
    projectId,
    autonomyLevel: (row.autonomyLevel as AutonomyLevel) ?? "assisted",
    brandColor: row.brandColor,
    brandName: row.brandName,
    conciergeEnabled: row.conciergeEnabled,
  };
}

export type SettingsPatch = Partial<Omit<Settings, "projectId">>;

/** Upsert a build's settings. */
export async function saveProjectSettings(projectId: string, patch: SettingsPatch): Promise<Settings> {
  const current = await getProjectSettings(projectId);
  const next: ProjectSettings = {
    projectId,
    autonomyLevel: patch.autonomyLevel ?? current.autonomyLevel,
    brandColor: patch.brandColor !== undefined ? patch.brandColor : current.brandColor,
    brandName: patch.brandName !== undefined ? patch.brandName : current.brandName,
    conciergeEnabled: patch.conciergeEnabled ?? current.conciergeEnabled,
    updatedAt: new Date(),
  };
  await db
    .insert(projectSettings)
    .values(next)
    .onConflictDoUpdate({
      target: projectSettings.projectId,
      set: {
        autonomyLevel: next.autonomyLevel,
        brandColor: next.brandColor,
        brandName: next.brandName,
        conciergeEnabled: next.conciergeEnabled,
        updatedAt: next.updatedAt,
      },
    });
  return getProjectSettings(projectId);
}
