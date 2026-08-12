"use client";

import { useEffect } from "react";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BODY_MUTED, H2, TITLE_FONT } from "@/lib/typography";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Next hands the boundary an error with a digest that ties this render
  // back to a server log line. The UI stays generic, but discarding the
  // digest entirely would make the failure unfindable.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    /* `bg-background`, not the `bg-charcoal-dark` back-compat alias: that name
       is a leftover from the GoHighLevel template and resolves to a literal
       #ffffff, so this screen stayed white with the product in dark mode. */
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        {/* No hero glyph. design.md: icons are nav and functional controls
            only — an empty/error state is text-first. */}
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="space-y-2 text-center">
            <h1 className={H2} style={TITLE_FONT}>
              Something went wrong
            </h1>
            <p className={BODY_MUTED}>
              An unexpected error occurred. Please try again or return to the
              dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
