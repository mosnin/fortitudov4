import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BODY_MUTED, H3 } from "@/lib/typography";

interface EmptyStateProps {
  /**
   * @deprecated Empty states are text-first (design.md): a hero icon is
   * decoration. The prop is accepted so existing call sites keep compiling, but
   * nothing is rendered for it.
   */
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Text-first empty state — a title, one muted line, an optional action pill.
 * No hero icon, no illustration, no tinted chip.
 *
 * This is THE empty state for the whole product. Both halves used to draw
 * their own: `(dashboard)` a left-aligned block under a `border-t` rule,
 * `(admin)` a centred `py-14 text-center` block with an `H3` — so the same
 * "nothing here yet" moment changed shape when you crossed from the portal to
 * the admin side. One component, one silhouette, everywhere.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className
      )}
    >
      {/* H3 (17px), not a one-off 15px: the ladder in `lib/typography.ts` runs
          30 · 25 · 21 · 17 · 14 · 12 · 11 and 15 is not a step on it. */}
      <h3 className={H3}>{title}</h3>
      {description && (
        <p className={cn(BODY_MUTED, "mt-1.5 max-w-md")}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
