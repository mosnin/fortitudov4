import Link from "next/link";
import { db } from "@/db";
import { projects, users, payments, decisionRequests } from "@/db/schema";
import { sql, eq, desc, ne } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const disciplineLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function AdminDashboardPage() {
  const [clientCount, activeCount, revenueRow, openDecisionCount, recent] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(users).where(ne(users.role, "admin")),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.status, "in_progress")),
    db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
      .from(payments)
      .where(eq(payments.status, "completed")),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(decisionRequests)
      .where(eq(decisionRequests.status, "open")),
    db
      .select({
        id: projects.id,
        name: projects.name,
        serviceType: projects.serviceType,
        status: projects.status,
        currentPhase: projects.currentPhase,
        clientFirst: users.firstName,
        clientLast: users.lastName,
        clientEmail: users.email,
      })
      .from(projects)
      .leftJoin(users, eq(projects.userId, users.id))
      .orderBy(desc(projects.createdAt))
      .limit(8),
  ]);

  const stats = [
    { label: "Clients", value: String(clientCount[0]?.c ?? 0) },
    { label: "Active Builds", value: String(activeCount[0]?.c ?? 0) },
    { label: "Revenue", value: formatUsd(revenueRow[0]?.total ?? 0) },
    { label: "Open Decisions", value: String(openDecisionCount[0]?.c ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Studio</h1>
        <p className="text-muted-foreground mt-1">Every client, build, and decision in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange" />
            Recent Builds
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Project</th>
                    <th className="pb-3 font-medium">Discipline</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((p) => {
                    const client =
                      `${p.clientFirst ?? ""} ${p.clientLast ?? ""}`.trim() || p.clientEmail || "—";
                    return (
                      <tr key={p.id} className="hover:bg-muted/50">
                        <td className="py-3">{client}</td>
                        <td className="py-3 font-medium">
                          <Link href={`/admin/projects/${p.id}`} className="hover:text-orange">
                            {p.name}
                          </Link>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {disciplineLabels[p.serviceType] ?? p.serviceType}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              p.status === "completed"
                                ? "success"
                                : p.status === "payment_pending"
                                ? "warning"
                                : "orange"
                            }
                          >
                            {p.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
