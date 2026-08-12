import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button system — paper-flat neutral-first (fused from the CRM reference).
 *
 * - Primary is NEAR-BLACK, not orange; orange lives on the `brand` variant
 *   and is reserved for rare hero moments.
 * - 150ms ease hover; active:scale-[0.98] for tactile press feedback
 *   (excluded on link, where scaling text reads as a bug).
 * - Ghost + outline share the sidebar's hover language (bg-foreground/[0.04]).
 * - Every size sits on `rounded-md`, the product's one control radius, so a
 *   button and the field beside it share a silhouette.
 *   product surface does not have. It survives for /checkout alone.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground hover:bg-brand/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive/60",
        outline:
          "border border-border bg-background hover:bg-foreground/[0.04] hover:text-foreground dark:bg-input/30 dark:hover:bg-foreground/[0.06]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-foreground/[0.04] hover:text-foreground dark:hover:bg-foreground/[0.06]",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
