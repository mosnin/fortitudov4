"use client";

/**
 * The modal shell the three partner forms share — create a partner, edit one,
 * open a request on their behalf.
 *
 * Same silhouette as the client modals: `bg-black/50` scrim (never
 * `bg-foreground/*` or `bg-background/*` — those invert with the theme), a
 * rounded bordered card, an `H2` title, and one primary pill at the foot.
 */

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BODY_MUTED, H2, PRIMARY_PILL, TITLE_FONT } from "@/lib/typography";

/** A form field: 13px label (chrome, not content) over the control. */
export function PartnerField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
      {hint && <p className={cn(BODY_MUTED, "mt-1.5 text-xs")}>{hint}</p>}
    </div>
  );
}

export function PartnerModal({
  open,
  title,
  description,
  submitLabel,
  saving,
  error,
  onClose,
  onSubmit,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  saving: boolean;
  /** The server's own `error` string, shown verbatim. */
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.form
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onSubmit={onSubmit}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(15,16,16,0.06),0_24px_60px_-16px_rgba(15,16,16,0.3)] sm:p-8"
          >
            <div className="flex items-start justify-between pb-1">
              <h2 className={H2} style={TITLE_FONT}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {description && (
              <p className={cn(BODY_MUTED, "pb-6")}>{description}</p>
            )}

            <div className="space-y-4">
              {children}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                className={cn(
                  PRIMARY_PILL,
                  "w-full justify-center disabled:opacity-50"
                )}
                disabled={saving}
              >
                {saving ? "Saving…" : submitLabel}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
