"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_PILL, SECTION_LABEL } from "@/lib/typography";

interface NPSSurveyProps {
  projectId: string;
  projectName: string;
  onDismiss: () => void;
}

export function NPSSurvey({ projectId, projectName, onDismiss }: NPSSurveyProps) {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === null) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          score,
          feedback: feedback || null,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="animate-fade-up rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-medium text-foreground">
          Thank you for your feedback
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your response helps us improve our service.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up relative rounded-xl border border-border bg-card p-6">
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted"
        aria-label="Dismiss survey"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <p className={SECTION_LABEL}>Project feedback</p>
      <h3 className="mt-2 text-[17px] font-semibold text-foreground">
        How was your experience?
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Rate your experience with &ldquo;{projectName}&rdquo;
      </p>

      <div className="mt-5 space-y-5">
        {/* Score selector */}
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            How likely are you to recommend us? (1&ndash;10)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={cn(
                  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm tabular-nums transition-colors",
                  score === n
                    ? "bg-foreground font-medium text-background"
                    : "border border-border text-foreground hover:bg-foreground/[0.04]"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Any additional feedback? (optional)
          </label>
          <Textarea
            placeholder="Tell us what we did well or how we can improve..."
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <button
          className={cn(PRIMARY_PILL, "disabled:pointer-events-none disabled:opacity-50")}
          onClick={handleSubmit}
          disabled={score === null || submitting}
        >
          {submitting ? "Submitting…" : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}
