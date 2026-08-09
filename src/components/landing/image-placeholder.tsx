import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marked slot for a real asset that hasn't been produced yet. Used by the
 * legacy marketing chrome; the logged-out site proper follows design.md.
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
          ? "border-white/25 bg-white/[0.04] text-white/40"
          : "border-black/20 bg-black/[0.03] text-black/40",
        className
      )}
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
