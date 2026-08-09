import { cn } from "@/lib/utils";

/** Orange tint tag that kicks 8° on hover, per the reference's package chips. */
export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[4px] bg-orange-tint px-2 py-1 text-[12px] leading-none font-medium whitespace-nowrap text-orange transition-[background-color,transform] duration-300 ease-out hover:rotate-[8deg] hover:bg-orange-tint-2",
        className
      )}
    >
      {children}
    </span>
  );
}
