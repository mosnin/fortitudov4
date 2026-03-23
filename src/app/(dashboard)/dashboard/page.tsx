import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhaseTrackerHorizontal, type Phase } from "@/components/dashboard/phase-tracker";
import { FolderKanban, MessageSquare, Upload, Plus } from "lucide-react";

// Demo data — will be replaced with real DB queries
const demoPhases: Phase[] = [
  { id: "1", name: "Discovery", status: "completed", order: 0 },
  { id: "2", name: "Design", status: "completed", order: 1 },
  { id: "3", name: "Development", status: "in_progress", order: 2 },
  { id: "4", name: "Testing", status: "pending", order: 3 },
  { id: "5", name: "Review", status: "pending", order: 4 },
  { id: "6", name: "Launch", status: "pending", order: 5 },
];

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {user?.firstName || "there"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your projects.
          </p>
        </div>
        <Button variant="glow" asChild>
          <Link href="/onboarding">
            <Plus className="mr-1 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10">
              <FolderKanban className="h-6 w-6 text-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10">
              <MessageSquare className="h-6 w-6 text-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10">
              <Upload className="h-6 w-6 text-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Files Uploaded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Project Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">My Web Application</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Web Application</p>
          </div>
          <Badge variant="orange">In Progress</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phase tracker */}
          <PhaseTrackerHorizontal phases={demoPhases} />

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects/demo">View Details</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/messages">
                <MessageSquare className="mr-1 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects/demo">
                <Upload className="mr-1 h-4 w-4" />
                Upload Files
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
