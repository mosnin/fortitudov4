import { cn } from "@/lib/utils";

/**
 * The reference's blueprint frame: a pair of 1px vertical rules pinned to the
 * content edges of every section — max(gutter, centering offset for the
 * 1600px content column).
 */
export function SectionRails({ dark = false }: { dark?: boolean }) {
  const color = dark ? "bg-line-dark" : "bg-line";
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 w-px",
          "left-[max(16px,calc((100vw-1600px)/2))] md:left-[max(24px,calc((100vw-1600px)/2))] lg:left-[max(64px,calc((100vw-1600px)/2))]",
          color
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 w-px",
          "right-[max(16px,calc((100vw-1600px)/2))] md:right-[max(24px,calc((100vw-1600px)/2))] lg:right-[max(64px,calc((100vw-1600px)/2))]",
          color
        )}
      />
    </>
  );
}

/** Full-bleed horizontal hairline, for framing grids inside a section. */
export function CrossRule({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 h-px w-screen -translate-x-1/2",
        dark ? "bg-line-dark" : "bg-line",
        className
      )}
    />
  );
}
