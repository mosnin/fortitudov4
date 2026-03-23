"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye, MousePointer, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
}

const metrics: Metric[] = [
  { label: "Page Views", value: "12,458", change: "+24%", trend: "up", icon: Eye },
  { label: "Unique Visitors", value: "3,842", change: "+18%", trend: "up", icon: MousePointer },
  { label: "Avg. Session", value: "2m 34s", change: "+8%", trend: "up", icon: Clock },
  { label: "Bounce Rate", value: "34%", change: "-5%", trend: "down", icon: TrendingUp },
];

const pageViews = [
  { page: "/", views: 4520, percentage: 100 },
  { page: "/products", views: 2830, percentage: 63 },
  { page: "/cart", views: 1240, percentage: 27 },
  { page: "/checkout", views: 890, percentage: 20 },
  { page: "/about", views: 640, percentage: 14 },
];

const recentEvents = [
  { event: "Form submission", count: 23, date: "Today" },
  { event: "Button click: Buy Now", count: 156, date: "Today" },
  { event: "Newsletter signup", count: 12, date: "Today" },
  { event: "Contact form", count: 8, date: "Yesterday" },
  { event: "Download: Brochure", count: 34, date: "Yesterday" },
];

export function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      metric.trend === "up" ? "text-success" : "text-destructive"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {metric.change}
                  </span>
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-orange" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pageViews.map((page) => (
              <div key={page.page}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-mono text-muted-foreground">{page.page}</span>
                  <span className="font-medium">{page.views.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange transition-all"
                    style={{ width: `${page.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MousePointer className="h-4 w-4 text-orange" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentEvents.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{event.event}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <Badge variant="secondary">{event.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
