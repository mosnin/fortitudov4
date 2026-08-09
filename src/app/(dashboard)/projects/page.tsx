import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/firecrawl";
import { EmptyState } from "@/components/ui/empty-state";
import { AsciiField } from "@/components/ui/ascii-field";
import {
  ProjectList,
  type ProjectListItem,
} from "@/components/dashboard/project-list";
import { FolderKanban, Plus } from "lucide-react";
import { db } from "@/db";
import { projects, projectPhases, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!dbUser) {
    return (
      <div className="space-y-8">
        <PageHero
          title="Projects"
          description="Your account is being set up. Please refresh in a moment."
        />
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
    <div className="space-y-10">
      <PageHero
        title="Projects"
        description="Track your builds, phases, and launch pipeline."
        action={
          <Button asChild>
            <Link href="/onboarding">
              <Plus className="mr-1 h-4 w-4" />
              New Project
            </Link>
          </Button>
        }
      />

      {userProjects.length === 0 ? (
        <div className="animate-fade-up relative overflow-hidden rounded-xl border border-border">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent 70%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 70%)",
            }}
          >
            <AsciiField className="h-full w-full opacity-40" />
          </div>
          <div className="relative">
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Start your first project and we'll build something great together."
              action={
                <Button asChild>
                  <Link href="/onboarding">
                    <Plus className="mr-1 h-4 w-4" />
                    New Project
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <ProjectList projects={listItems} />
      )}
    </div>
  );
}
