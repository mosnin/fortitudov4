"use client";

import type { CSSProperties, ReactNode } from "react";

// Wraps a client's portal content in a scoped brand accent. Sets `--brand` so
// descendants can opt into it, and lays a faint brand-tinted radial + hairline
// top accent over the content — never overriding the orange system default.
export function ProjectBrand({
  brandColor,
  children,
}: {
  brandColor: string | null;
  children: ReactNode;
}) {
  if (!brandColor) return <>{children}</>;

  const style = {
    "--brand": brandColor,
    borderTop: "1px solid color-mix(in srgb, var(--brand) 55%, transparent)",
    backgroundImage:
      "radial-gradient(ellipse at 50% -10%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 60%)",
  } as CSSProperties;

  return (
    <div className="relative" style={style} data-brand>
      {children}
    </div>
  );
}

export default ProjectBrand;
