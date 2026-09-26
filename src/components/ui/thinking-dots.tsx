/**
 * ThinkingDots — three dots that bounce in sequence, beside a live label.
 *
 * From Spectrum UI's thinking-dots. The keyframes live in globals.css
 * (`su-dot`); the label is a TextStates so it can advance through phases
 * ("Reading your project" → "Writing an answer") without jumping.
 */

import { TextStates } from "@/components/ui/text-states";
import { cn } from "@/lib/utils";

export function ThinkingDots({
  label = "Thinking",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex w-fit items-center gap-2.5 text-muted-foreground", className)}
    >
      <span aria-hidden className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-brand motion-reduce:!animate-none"
            style={{ animation: `su-dot 1.2s ease-in-out ${i * 160}ms infinite` }}
          />
        ))}
      </span>
      <TextStates text={label} className="text-xs" />
    </div>
  );
}
