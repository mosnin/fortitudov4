import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { STATUS_PILL, STATUS_PILL_ACTIVE } from "@/lib/typography";

/**
 * Badge (design.md §Pills).
 *
 * In the product surface a badge is a WORD in a neutral bordered pill — never
 * a color-coded category chip and never an icon. The product variants are
 * `STATUS_PILL` / `STATUS_PILL_ACTIVE` themselves rather than a second copy of
 * them: three near-identical pill definitions is how the surface drifted apart
 * in the first place. `RowPill` renders the same two strings, so a badge and a
 * record row's status word are the same object.
 *
 * The filled variants (`outline`, `secondary`, `success`, `warning`, `brand`)
 * belong to the logged-out marketing pages. Do not reach for them behind the
 * login — `brand` in particular is punctuation, not a category color.
 */
const MARKETING_CHIP = "rounded-md border px-2.5 py-0.5 text-xs font-semibold";

const badgeVariants = cva("inline-flex items-center transition-colors", {
  variants: {
    variant: {
      /** The product default. */
      default: STATUS_PILL,
      /** Emphasised, still monochrome. */
      active: STATUS_PILL_ACTIVE,
      /** Genuine semantics only: failed / overdue / destructive. */
      destructive: `${STATUS_PILL} border-destructive/30 text-destructive`,
      outline: `${MARKETING_CHIP} border-border text-foreground`,
      secondary: `${MARKETING_CHIP} border-transparent bg-secondary text-secondary-foreground`,
      success: `${MARKETING_CHIP} border-transparent bg-success/10 text-success`,
      warning: `${MARKETING_CHIP} border-transparent bg-warning/10 text-warning`,
      /** Marketing only (design.md). Not a product category color. */
      brand: `${MARKETING_CHIP} border-transparent bg-brand/10 text-brand`,
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
