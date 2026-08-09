import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png";

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
