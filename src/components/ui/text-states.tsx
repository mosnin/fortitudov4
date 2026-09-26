"use client";

/**
 * TextStates — a label that swaps its text in place: the old text exits up
 * with a touch of blur, the new one enters from below.
 *
 * From Spectrum UI's text-states (the transitions.dev "text states swap"
 * recipe), unchanged in behavior. The CSS lives in globals.css
 * (`.t-text-swap`) instead of an inline <style> per instance.
 *
 * Use it wherever a status word changes while the user watches: Save → Saving…
 * → Saved, a stage label advancing, Helix's "Reading…" → "Writing…".
 *
 * @example
 * <TextStates text={saving ? "Saving…" : "Save"} />
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextStatesProps {
  text: string;
  /** Duration of each phase (exit, enter) in ms. */
  duration?: number;
  className?: string;
}

export function TextStates({ text, duration = 150, className }: TextStatesProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [shown, setShown] = React.useState(text);

  // Exit the old text, then commit the new one after a phase.
  React.useEffect(() => {
    if (text === shown) return;
    ref.current?.classList.add("is-exit");
    const timer = window.setTimeout(() => setShown(text), duration);
    return () => window.clearTimeout(timer);
  }, [text, shown, duration]);

  // Jump below without a transition, force a reflow, then release upward.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.classList.contains("is-exit")) return;
    el.classList.remove("is-exit");
    el.classList.add("is-enter-start");
    void el.offsetHeight;
    el.classList.remove("is-enter-start");
  }, [shown]);

  return (
    <span
      ref={ref}
      className={cn("t-text-swap", className)}
      style={{ "--text-swap-dur": `${duration}ms` } as React.CSSProperties}
    >
      {shown}
    </span>
  );
}
