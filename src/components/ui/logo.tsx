import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

/** Fortitudo mark — square brand tile at the requested height. */
export function Logo({ size = 32, className, withWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2", className)}>
      {/* Masked, so the mark is yellow on charcoal and ink on paper without
          the call site having to know which surface it is on. */}
      <BrandMark className="shrink-0" style={{ height: size, width: size }} />
      {withWordmark && (
        <span
          className="font-title text-foreground"
          style={{ fontSize: Math.round(size * 0.62) }}
        >
          Fortitudo
        </span>
      )}
    </span>
  );
}

/** Full lockup — kept for API compatibility with ported components. */
export function LogoWordmark({ size = 40, className }: LogoProps) {
  return <Logo size={size} className={className} />;
}
