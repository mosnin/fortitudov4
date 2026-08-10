import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CAPTION, SECTION_LABEL, STAT_NUMBER, TITLE_FONT } from "@/lib/typography";

interface StatCardProps {
  label: string;
  value: string | number;
  /**
   * @deprecated Metric tiles carry no icon (design-product.md — no decorative
   * icons). Accepted so existing call sites keep compiling; never rendered.
   */
  icon?: LucideIcon;
  /** Optional supporting note under the value (e.g. "3 new this week"). */
  hint?: string;
  className?: string;
}

/**
 * Standard metric tile — quiet label, focal number, optional caption. Neutral
 * and text-first: no icon chip, no accent color, numbers in `tabular-nums`.
 */
export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <p className={cn(SECTION_LABEL, "truncate")}>{label}</p>
        <p className={cn(STAT_NUMBER, "mt-2")} style={TITLE_FONT}>
          {value}
        </p>
        {hint && <p className={cn(CAPTION, "mt-1 tabular-nums")}>{hint}</p>}
      </CardContent>
    </Card>
  );
}
