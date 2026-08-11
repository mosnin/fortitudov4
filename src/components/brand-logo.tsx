import { cn } from "@/lib/utils";
import { BrandMark, BRAND_MARK_SRC } from "@/components/brand-mark";

/**
 * The Fortitudo lockup: the mark image plus a plain-text "Fortitudo"
 * wordmark. Height-driven via Tailwind (pass e.g. `h-6`) exactly like the
 * component it replaces, so every ported call site keeps its rendered size.
 * The wordmark inherits the surrounding text color unless a `textClassName`
 * overrides it (e.g. `text-white` on a dark image panel).
 */

/** Kept as the canonical path for the few call sites that still need a URL. */
export const FORTITUDO_MARK_SRC = BRAND_MARK_SRC;

interface BrandLogoProps {
  className?: string;
  /** Accepted for call-site compatibility; the wordmark names the brand, so
   *  labelling the mark too would make a screen reader say it twice. */
  alt?: string;
  /** Classes for the text wordmark; defaults to a quiet nav-text treatment. */
  textClassName?: string;
}

export function BrandLogo({ className, textClassName }: BrandLogoProps) {
  return (
    <span className={cn("relative inline-flex items-center gap-2", className)}>
      {/* Masked rather than an <img> so the mark inherits its surface's
          colour: racing yellow on the charcoal logged-out site, foreground ink
          in the product. `alt` is accepted for call-site compatibility but not
          applied — the wordmark below already names the brand. */}
      <BrandMark className="h-full" />
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
