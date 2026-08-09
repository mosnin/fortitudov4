import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marked slot for a real asset (photo / illustration / render) that hasn't
 * been produced yet. Swap each instance for the final image; the label says
 * what belongs there.
 */
export function ImagePlaceholder({
  label,
  className,
  dark = false,
}: {
  label: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 border border-dashed select-none",
        dark
          ? "border-white/25 bg-white/[0.04] text-cream/40"
          : "border-ink/20 bg-ink/[0.03] text-ink/40",
        className
      )}
      style={{
        backgroundImage: dark
          ? "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px)"
          : "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(26,26,24,0.02) 10px, rgba(26,26,24,0.02) 11px)",
      }}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
      <span className="max-w-[85%] text-center font-mono text-[10px] leading-snug tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}
