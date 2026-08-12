import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The one form select — the native control, wearing the product's control
 * silhouette.
 *
 * `h-9 rounded-md border-border` is that silhouette: `Input`, `Button`,
 * `FilterSelect` and `RowSelect` all carry it. Selects did not. Every admin
 * form rolled its own `selectClass` and they disagreed — `h-11 rounded-lg` in
 * five files, `h-10 rounded-full` in two — so a text field and the dropdown
 * beside it in the SAME modal were two different heights with two different
 * corner radii. That is the "elements aren't formatted correctly" complaint in
 * its most literal form.
 *
 * Exported as a class string as well as a component, because a few call sites
 * (a `<select>` that needs extra ARIA plumbing, a native date input that has to
 * line up with one) style the element themselves.
 */
export const SELECT_CLASS =
  "flex h-9 w-full cursor-pointer rounded-md border border-border bg-background " +
  "px-3 text-sm text-foreground outline-none transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select ref={ref} className={cn(SELECT_CLASS, className)} {...props}>
      {children}
    </select>
  );
});
Select.displayName = "Select";

export { Select };
