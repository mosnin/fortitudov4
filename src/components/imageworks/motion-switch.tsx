"use client";
// Imageworks theme-switch geometry, adapted to offer a pause for continuous imagery.
import { Pause, Play } from "lucide-react";
import { useContext } from "react";
import { MotionControlContext } from "./lib/motion";
export function MotionSwitch() {
  const { paused, toggle } = useContext(MotionControlContext);
  return (
    <div className="fixed right-6 bottom-6 z-20">
      <button
        onClick={toggle}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted text-foreground shadow-lg transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={paused ? "Resume animations" : "Pause animations"}
        aria-pressed={paused}
        type="button"
      >
        {paused ? (
          <Play className="size-4" aria-hidden />
        ) : (
          <Pause className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
