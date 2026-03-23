import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhaseTrackerHorizontal, type Phase } from "@/components/dashboard/phase-tracker";
import { Plus, ArrowRight } from "lucide-react";

const demoProject = {
  id: "demo",
  name: "My Web Application",
  serviceType: "Web Application",
  status: "in_progress" as const,
  phases: [
    { id: "1", name: "Discovery", status: "completed" as const, order: 0 },
    { id: "2", name: "Design", status: "completed" as const, order: 1 },
    { id: "3", name: "Development", status: "in_progress" as const, order: 2 },
    { id: "4", name: "Testing", status: "pending" as const, order: 3 },
    { id: "5", name: "Review", status: "pending" as const, order: 4 },
    { id: "6", name: "Launch", status: "pending" as const, order: 5 },
  ] satisfies Phase[],
};

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your projects.
          </p>
        </div>
        <Button variant="glow" asChild>
          <Link href="/onboarding">
            <Plus className="mr-1 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Project list */}
      <div className="space-y-4">
        <Card className="hover:border-orange/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{demoProject.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {demoProject.serviceType}
              </p>
            </div>
            <Badge variant="orange">In Progress</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhaseTrackerHorizontal phases={demoProject.phases} />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${demoProject.id}`}>
                  View Project
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
