import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Reference-signature CTA: a solid face sitting on a darker bottom edge.
 * Pressing collapses the edge (pb-1 -> pb-0, mt-1) so the button physically
 * depresses. Face and edge colors come in three voices.
 */
const faces = {
  orange:
    "bg-orange text-white hover:bg-orange-hover active:bg-orange-active",
  dark: "bg-ink text-white hover:bg-[#2A2A2A] active:bg-[#3A3A3A]",
  light: "bg-white text-ink hover:bg-surface active:bg-line",
} as const;

const edges = {
  orange: "bg-orange-edge",
  dark: "bg-[#626262]",
  light: "bg-[#BDBDBD]",
} as const;

const sizes = {
  md: "px-4 py-2 text-[16px]",
  lg: "px-6 py-3 text-[18px]",
} as const;

interface PressButtonProps {
  href: string;
  variant?: keyof typeof faces;
  size?: keyof typeof sizes;
  className?: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}

export function PressButton({
  href,
  variant = "orange",
  size = "lg",
  className,
  wrapperClassName,
  children,
}: PressButtonProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] pb-1 transition-[padding,margin] duration-75 active:mt-1 active:pb-0",
        edges[variant],
        wrapperClassName
      )}
    >
      <Link
        href={href}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-[12px] font-medium leading-normal tracking-[-0.015em] transition-colors",
          faces[variant],
          sizes[size],
          className
        )}
      >
        {children}
      </Link>
    </div>
  );
}
