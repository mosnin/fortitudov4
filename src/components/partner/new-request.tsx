"use client";

/**
 * Starting a request.
 *
 * A page of its own rather than an inline composer on the list. Two reasons:
 * the list IS the list (plans/partners.md) and growing a second mode into it
 * costs the thing that makes it readable; and scope is the field that decides
 * how close the first price lands, so it wants a textarea with room rather than
 * a row that expands. A page is also a URL — linkable, refreshable, and a place
 * a half-written request survives a mis-click.
 *
 * Two ways out, because a draft is a real state here: save it and come back, or
 * send it now. Both are ONE write — the create route accepts `status:
 * "submitted"` and puts it through the same `canPartnerSubmitRequest` the
 * update route uses, so sending never leaves a half-made request behind.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CrmPageHeader, SectionHead } from "@/components/crm";
import {
  BODY_MUTED,
  GHOST_PILL,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_RHYTHM,
} from "@/lib/typography";
import { cn } from "@/lib/utils";
import { createRequest } from "./api";
import {
  EMPTY_DRAFT,
  MoneyCells,
  RequestFields,
  draftToPayload,
  validateDraft,
  type RequestDraft,
} from "./request-form";

export function NewRequest() {
  const router = useRouter();
  const [draft, setDraft] = useState<RequestDraft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState<null | "draft" | "send">(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(mode: "draft" | "send") {
    const problem = validateDraft(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(mode);

    const created = await createRequest({
      ...draftToPayload(draft),
      ...(mode === "send" && { status: "submitted" as const }),
    });

    if (!created.ok) {
      setBusy(null);
      // The server's own words. It knows which field it refused and why.
      setError(created.error);
      return;
    }

    // Straight to the request itself — the list is one click further on, and
    // landing on the thing you just made is the confirmation.
    router.push(created.id ? `/partner/requests/${created.id}` : "/partner");
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
          title="New request"
          subtitle="Tell us what you want built. We'll come back with a price."
        />

        <MoneyCells
          budget={draft.budget}
          onBudgetChange={(next) => setDraft({ ...draft, budget: next })}
          request={null}
        />

        <section className={SECTION_RHYTHM}>
          <SectionHead title="What you want built" />

          <RequestFields value={draft} onChange={setDraft} />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className={BODY_MUTED}>
            A draft stays with you until you send it. We only see it once it&apos;s
            sent.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => submit("send")}
              disabled={busy !== null}
              className={cn(PRIMARY_PILL, "disabled:opacity-50")}
            >
              {busy === "send" ? "Sending…" : "Send to us"}
            </button>
            <button
              type="button"
              onClick={() => submit("draft")}
              disabled={busy !== null}
              className={cn(GHOST_PILL, "disabled:opacity-50")}
            >
              {busy === "draft" ? "Saving…" : "Save as draft"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
