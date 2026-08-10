import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BODY_MUTED } from "@/lib/typography";

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
      <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
      {description && (
        <p className={cn(BODY_MUTED, "mt-1.5 max-w-sm")}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
