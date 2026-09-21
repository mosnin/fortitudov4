import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
type Props = Omit<ComponentProps<typeof Link>, "children"> & { children: ReactNode };
export function ArrowButton({ children, className = "", ...props }: Props) {
  return <Link {...props} className={`button-05 ${className}`}><span className="glass" aria-hidden="true" /><span className="content"><span className="copy">{children}</span></span></Link>;
}
export function ArrowAction({ children, className = "", ...props }: ComponentProps<"button">) {
  return <button type="button" {...props} className={`button-05 ${className}`}><span className="glass" aria-hidden="true" /><span className="content"><span className="copy">{children}</span></span></button>;
}
