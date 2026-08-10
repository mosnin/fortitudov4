import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge (design-product.md §Pills).
 *
 * In the product surface a badge is a WORD in a neutral bordered pill — never
 * a color-coded category chip and never an icon. `default` therefore renders
 * `STATUS_PILL`; `active` is its emphasised twin. Color is reserved for genuine
 * semantics (`destructive`).
 *
 * The remaining filled variants (`secondary`, `success`, `warning`, `orange`)
 * belong to the logged-out marketing pages, which follow `design.md`. Do not
 * reach for them behind the login — `orange` in particular is brand
 * punctuation, not a category color.
 *
 * Shape/size live per-variant so the product pills can be 10px `rounded-full`
 * while the marketing chips keep their 12px `rounded-md` proportions.
 */
const MARKETING_CHIP =
  "rounded-md border px-2.5 py-0.5 text-xs font-semibold";
const PRODUCT_PILL = "rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wide";

const badgeVariants = cva(
  "inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        /** STATUS_PILL — the product default. */
        default: `${PRODUCT_PILL} border border-border text-muted-foreground`,
        /** STATUS_PILL_ACTIVE — emphasised, still monochrome. */
        active: `${PRODUCT_PILL} bg-foreground/[0.06] text-foreground/70`,
        /** Genuine semantics only: failed / overdue / destructive. */
        destructive: `${PRODUCT_PILL} border border-destructive/30 text-destructive`,
        outline: `${MARKETING_CHIP} border-border text-foreground`,
        secondary: `${MARKETING_CHIP} border-transparent bg-secondary text-secondary-foreground`,
        success: `${MARKETING_CHIP} border-transparent bg-success/10 text-success`,
        warning: `${MARKETING_CHIP} border-transparent bg-warning/10 text-warning`,
        /** Marketing only (design.md). Not a product category color. */
        orange: `${MARKETING_CHIP} border-transparent bg-orange/10 text-orange`,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
