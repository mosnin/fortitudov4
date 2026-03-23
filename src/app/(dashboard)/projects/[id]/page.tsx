"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PhaseTracker, type Phase } from "@/components/dashboard/phase-tracker";
import {
  Upload,
  Send,
  FileText,
  MessageSquare,
  RotateCcw,
} from "lucide-react";

const demoPhases: Phase[] = [
  { id: "1", name: "Discovery", description: "Understanding your requirements and goals", status: "completed", order: 0 },
  { id: "2", name: "Design", description: "Creating wireframes and visual design", status: "completed", order: 1 },
  { id: "3", name: "Development", description: "Building your application", status: "in_progress", order: 2 },
  { id: "4", name: "Testing", description: "Quality assurance and bug fixes", status: "pending", order: 3 },
  { id: "5", name: "Review", description: "Your review and feedback", status: "pending", order: 4 },
  { id: "6", name: "Launch", description: "Deployment and go-live", status: "pending", order: 5 },
];

const demoFiles = [
  { name: "brand-guide.pdf", size: "2.4 MB", date: "Mar 15, 2026" },
  { name: "logo-assets.zip", size: "8.1 MB", date: "Mar 14, 2026" },
  { name: "content-doc.docx", size: "156 KB", date: "Mar 12, 2026" },
];

export default function ProjectDetailPage() {
  const [revisionText, setRevisionText] = useState("");

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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Phase tracker */}
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

        {/* Right: Files & Info */}
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
                  Drag & drop files or click to upload
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Choose Files
                </Button>
              </div>

              {/* Uploaded files */}
              <div className="space-y-2">
                {demoFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-orange" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.size} &middot; {file.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
}
