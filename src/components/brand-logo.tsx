import { cn } from "@/lib/utils";

/**
 * The Fortitudo lockup: the mark image plus a plain-text "Fortitudo"
 * wordmark. Height-driven via Tailwind (pass e.g. `h-6`) exactly like the
 * component it replaces, so every ported call site keeps its rendered size.
 * The wordmark inherits the surrounding text color unless a `textClassName`
 * overrides it (e.g. `text-white` on a dark image panel).
 */

export const FORTITUDO_MARK_SRC =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png";

interface BrandLogoProps {
  className?: string;
  alt?: string;
  /** Classes for the text wordmark; defaults to a quiet nav-text treatment. */
  textClassName?: string;
}

export function BrandLogo({
  className,
  alt = "Fortitudo",
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn("relative inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FORTITUDO_MARK_SRC}
        alt={alt}
        loading="eager"
        decoding="async"
        className="block h-full w-auto rounded-md"
      />
      <span
        className={cn(
          "font-medium tracking-tight text-foreground",
          textClassName ?? "text-base",
        )}
      >
        Fortitudo
      </span>
    </span>
  );
}
