import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC =
  "/brand/fortitudo-mark.png";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

/** Fortitudo mark — square brand tile at the requested height. */
export function Logo({ size = 32, className, withWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2", className)}>
      <Image
        src={LOGO_SRC}
        alt="Fortitudo"
        height={size}
        width={size}
        className="shrink-0 rounded-md"
      />
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
