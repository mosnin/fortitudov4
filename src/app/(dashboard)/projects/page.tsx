import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { PageHero } from "@/components/ui/firecrawl";
import {
  ProjectList,
  type ProjectListItem,
} from "@/components/dashboard/project-list";
import { db } from "@/db";
import { projects, projectPhases, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  PRIMARY_PILL,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
} from "@/lib/typography";

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!dbUser) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={READING_COL}>
          <PageHero
            section="Workspace"
            title="Projects"
            description="Your account is being set up. Please refresh in a moment."
          />
        </div>
      </div>
    );
  }

  // Personal client surface — only the user's own projects (see dashboard).
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, dbUser.id));

  const projectIds = userProjects.map((p) => p.id);
  const allPhases =
    projectIds.length > 0
      ? await db
          .select()
          .from(projectPhases)
          .where(inArray(projectPhases.projectId, projectIds))
      : [];

  const listItems: ProjectListItem[] = userProjects.map((project) => ({
    id: project.id,
    name: project.name,
    serviceType: project.serviceType,
    status: project.status,
    phases: allPhases
      .filter((p) => p.projectId === project.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        order: p.order,
      })),
  }));

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Workspace"
          title="Projects"
          description="Track your builds, phases, and launch pipeline."
          action={
            <Link href="/onboarding" className={PRIMARY_PILL}>
              New project
            </Link>
          }
        />

        <section className={SECTION_RHYTHM}>
          <p className={SECTION_LABEL}>
            <span className="tabular-nums text-foreground/70">
              {userProjects.length}
            </span>{" "}
            {userProjects.length === 1 ? "project" : "projects"}
          </p>
          {userProjects.length === 0 ? (
            <div className="border-t border-border py-10">
              <p className="text-sm font-medium text-foreground">
                No projects yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start your first project and we&rsquo;ll build something great
                together.
              </p>
              <Link href="/onboarding" className={cn(PRIMARY_PILL, "mt-5")}>
                New project
              </Link>
            </div>
          ) : (
            <ProjectList projects={listItems} />
          )}
        </section>
      </div>
    </div>
  );
}
