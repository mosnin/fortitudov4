import { PageHero } from "@/components/ui/firecrawl";

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
 * Legacy alias for the canonical page frame. `PageHero` IS the product header
 * (design.md): quiet section line, serif H1, one muted subtitle. This
 * wrapper keeps older `PageHeader` call sites on the same frame — prefer
 * importing `PageHero` directly in new code.
 */
export function PageHeader({
  title,
  description,
  action,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <PageHero
      title={title}
      description={description}
      action={action}
      section={eyebrow}
      className={className}
    />
  );
}
