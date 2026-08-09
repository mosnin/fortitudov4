import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  orange:
    "bg-orange text-white shadow-[0_2px_12px_rgba(249,115,22,0.35)] hover:bg-orange-dark hover:shadow-[0_4px_18px_rgba(249,115,22,0.45)]",
  ink: "bg-ink text-cream hover:bg-charcoal-dark",
  outline:
    "border border-ink/20 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5",
  "outline-light":
    "border border-cream/30 bg-transparent text-cream hover:border-cream/60 hover:bg-cream/10",
  paper: "bg-paper text-ink border border-line hover:border-ink/30",
} as const;

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-8 text-[15px]",
} as const;

interface PillLinkProps {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}

export function PillLink({
  href,
  variant = "orange",
  size = "md",
  className,
  children,
}: PillLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-all duration-200 hover:-translate-y-px active:translate-y-0",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
