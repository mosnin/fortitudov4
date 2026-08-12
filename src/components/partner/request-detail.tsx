"use client";

/**
 * One request: what they asked for, what we said, what happens next.
 *
 * Two states, and the difference between them is stated rather than implied.
 * While the request is `draft` or `submitted` it is a form. From `reviewing`
 * onwards it is a record, and the page says why in a sentence — a field that
 * silently stops accepting input reads as a bug, not a rule.
 *
 * Our quote is never an input in either state.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CrmPageHeader, RowPill, SectionHead } from "@/components/crm";
import { SERVICE_LABELS } from "@/lib/services";
import {
  BODY,
  BODY_MUTED,
  GHOST_PILL,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_RHYTHM,
} from "@/lib/typography";
import { cn } from "@/lib/utils";
import { updateRequest } from "./api";
import {
  MoneyCells,
  RequestFields,
  draftFromRequest,
  draftToPayload,
  validateDraft,
  type RequestDraft,
} from "./request-form";
import {
  formatDay,
  isEditable,
  lockedReason,
  nextStep,
  statusLabel,
  type PartnerRequestView,
} from "./request-view";

export function RequestDetail({ request }: { request: PartnerRequestView }) {
  const router = useRouter();
  const editable = isEditable(request.status);

  const [draft, setDraft] = useState<RequestDraft>(() =>
    draftFromRequest(request)
  );
  const [busy, setBusy] = useState<null | "save" | "send">(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    const problem = validateDraft(draft);
    if (problem) {
      setError(problem);
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(false);
    setBusy("save");
    const result = await updateRequest(request.id, draftToPayload(draft));
    setBusy(null);
    if (!result.ok) {
      // The server's own words, not a house message — it knows what went wrong.
      setError(result.error);
      return;
    }
    // Only after a response we actually read. Nothing here claims a save it
    // did not see.
    setSaved(true);
    router.refresh();
  }

  /**
   * The one status move a partner may make: their own draft → submitted.
   *
   * Sent as a single PATCH carrying the edits AND the status, so what we
   * receive is what was on screen. Two writes could leave a request submitted
   * with the previous draft's text if the second one failed.
   */
  async function send() {
    const problem = validateDraft(draft);
    if (problem) {
      setError(problem);
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(false);
    setBusy("send");
    const result = await updateRequest(request.id, {
      ...draftToPayload(draft),
      status: "submitted",
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <div>
          <Link href="/partner" className={QUIET_LINK}>
            Back to requests
          </Link>
        </div>

        <CrmPageHeader
          section="Request."
          title={request.title}
          subtitle={
            <span className="flex flex-wrap items-center gap-2">
              <RowPill emphasis={request.status === "quoted"}>
                {statusLabel(request.status)}
              </RowPill>
              <span>{nextStep(request.status)}</span>
            </span>
          }
          action={
            request.status === "draft" ? (
              <button
                type="button"
                onClick={send}
                disabled={busy !== null}
                className={cn(PRIMARY_PILL, "disabled:opacity-50")}
              >
                {busy === "send" ? "Sending…" : "Send to us"}
              </button>
            ) : undefined
          }
        />

        <MoneyCells
          budget={draft.budget}
          onBudgetChange={
            editable
              ? (next) => {
                  setDraft({ ...draft, budget: next });
                  setSaved(false);
                }
              : undefined
          }
          request={request}
        />

        <section className={SECTION_RHYTHM}>
          <SectionHead
            title="What you asked for"
            meta={`Updated ${formatDay(request.updatedAt)}`}
          />

          {editable ? (
            <>
              <RequestFields
                value={draft}
                onChange={(next) => {
                  setDraft(next);
                  setSaved(false);
                }}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}
              {saved && !error && <p className={BODY_MUTED}>Saved.</p>}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy !== null}
                  className={cn(PRIMARY_PILL, "disabled:opacity-50")}
                >
                  {busy === "save" ? "Saving…" : "Save changes"}
                </button>
                <Link href="/partner" className={GHOST_PILL}>
                  Done
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className={BODY_MUTED}>{lockedReason(request.status)}</p>
              <ReadOnlyRecord request={request} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/** The request as a record once it is no longer theirs to change. */
function ReadOnlyRecord({ request }: { request: PartnerRequestView }) {
  return (
    <dl className="divide-y divide-border/60">
      <Row label="Service">{SERVICE_LABELS[request.serviceType]}</Row>
      <Row label="Scope">
        {request.scope ? (
          <span className="whitespace-pre-wrap">{request.scope}</span>
        ) : (
          <span className="text-muted-foreground">Nothing written down.</span>
        )}
      </Row>
      <Row label="Needed by">
        {formatDay(request.targetDate) ?? (
          <span className="text-muted-foreground">No date set.</span>
        )}
      </Row>
    </dl>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-[13px] font-medium text-muted-foreground">{label}</dt>
      <dd className={BODY}>{children}</dd>
    </div>
  );
}
