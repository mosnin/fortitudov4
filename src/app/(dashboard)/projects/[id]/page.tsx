"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PhaseTracker, type Phase } from "@/components/dashboard/phase-tracker";
import { FilePreviewCard } from "@/components/dashboard/file-preview";
import { ProjectComments } from "@/components/dashboard/project-comments";
import { NPSSurvey } from "@/components/dashboard/nps-survey";
import { InvoiceCard } from "@/components/dashboard/invoice-card";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Upload,
  Send,
  MessageSquare,
  RotateCcw,
  BarChart3,
  Receipt,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const demoPhases: Phase[] = [
  { id: "1", name: "Discovery", description: "Understanding your requirements and goals", status: "completed", order: 0 },
  { id: "2", name: "Design", description: "Creating wireframes and visual design", status: "completed", order: 1 },
  { id: "3", name: "Development", description: "Building your application", status: "in_progress", order: 2 },
  { id: "4", name: "Testing", description: "Quality assurance and bug fixes", status: "pending", order: 3 },
  { id: "5", name: "Review", description: "Your review and feedback", status: "pending", order: 4 },
  { id: "6", name: "Launch", description: "Deployment and go-live", status: "pending", order: 5 },
];

const demoFiles = [
  { name: "brand-guide.pdf", url: "#", size: "2.4 MB", type: "application/pdf" },
  { name: "hero-mockup.png", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png", size: "856 KB", type: "image/png" },
  { name: "content-doc.docx", url: "#", size: "156 KB", type: "application/docx" },
];

const tabItems = [
  { value: "progress", label: "Progress", icon: RotateCcw },
  { value: "comments", label: "Comments", icon: MessageCircle },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function ProjectDetailPage() {
  const [revisionText, setRevisionText] = useState("");
  const [showSurvey, setShowSurvey] = useState(true);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Web Application</h1>
          <p className="text-muted-foreground mt-1">Web Application</p>
        </div>
        <Badge variant="orange" className="text-sm px-3 py-1">
          In Progress
        </Badge>
      </div>

      {/* NPS Survey (shows when project is near completion) */}
      {showSurvey && (
        <NPSSurvey
          projectName="My Web Application"
          onDismiss={() => setShowSurvey(false)}
        />
      )}

      {/* Tabbed content */}
      <Tabs.Root defaultValue="progress">
        <Tabs.List className="flex gap-1 border-b border-border mb-6">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent cursor-pointer",
                  "data-[state=active]:border-orange data-[state=active]:text-orange",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {/* Progress tab */}
        <Tabs.Content value="progress">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-orange" />
                    Build Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhaseTracker phases={demoPhases} />
                </CardContent>
              </Card>

              {/* Revision Request */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-orange" />
                    Request a Revision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe what you'd like changed..."
                    rows={3}
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                  />
                  <Button disabled={!revisionText.trim()}>
                    <Send className="mr-1 h-4 w-4" />
                    Submit Revision Request
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Upload Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-orange" />
                    Files
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Choose Files
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {demoFiles.map((file) => (
                      <FilePreviewCard
                        key={file.name}
                        name={file.name}
                        url={file.url}
                        type={file.type}
                        size={file.size}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice */}
              <InvoiceCard />

              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span>Web Application</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="orange" className="text-xs">In Progress</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>Mar 10, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <Badge variant="success" className="text-xs">Paid</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs.Content>

        {/* Comments tab */}
        <Tabs.Content value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange" />
                Project Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectComments />
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Analytics tab */}
        <Tabs.Content value="analytics">
          <AnalyticsOverview />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
