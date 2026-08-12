import { CrmPageHeader } from "@/components/crm";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional right-aligned action(s), e.g. a button. */
  action?: React.ReactNode;
  /** Quiet section line above the title, e.g. "Operations". */
  eyebrow?: string;
  className?: string;
}

/**
 * Legacy alias for the canonical page frame. `CrmPageHeader` IS the product
 * header (design.md) — this forwards to it rather than drawing a second one,
 * so every page keeps the same three lines no matter which name it imports.
 * Prefer importing `CrmPageHeader` directly in new code.
 */
export function PageHeader({
  title,
  description,
  action,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <CrmPageHeader
      title={title}
      subtitle={description}
      action={action}
      section={eyebrow}
      className={className}
    />
  );
}
