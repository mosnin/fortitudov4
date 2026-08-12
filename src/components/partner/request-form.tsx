"use client";

/**
 * The fields a partner may write, and nothing else.
 *
 * The list is `title`, `scope`, `serviceType`, `budgetCents`, `targetDate` —
 * the same five `PARTNER_EDITABLE_REQUEST_FIELDS` names in lib/partners.ts.
 * `quotedCents` has no control here and must never gain one: it is rendered as
 * text by `MoneyCells` below, never as an input, not even a disabled one. A
 * greyed-out box still says "this is a field of yours that happens to be
 * locked", and our price is not a field of theirs.
 */

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Stat, StatCell, StatEmpty, StatStrip } from "@/components/crm";
import { SERVICE_LABELS, type ServiceType } from "@/lib/services";
import { CAPTION } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { formatMoney, hasQuote, type PartnerRequestView } from "./request-view";

/** The form's own state — strings, because that is what inputs hold. */
export interface RequestDraft {
  title: string;
  scope: string;
  serviceType: ServiceType | "";
  /** Whole dollars as typed. Converted to integer cents on the way out. */
  budget: string;
  /** `yyyy-mm-dd` from a native date input. */
  targetDate: string;
}

export const EMPTY_DRAFT: RequestDraft = {
  title: "",
  scope: "",
  serviceType: "",
  budget: "",
  targetDate: "",
};

export function draftFromRequest(request: PartnerRequestView): RequestDraft {
  return {
    title: request.title,
    scope: request.scope ?? "",
    serviceType: request.serviceType,
    budget: request.budgetCents === null ? "" : String(request.budgetCents / 100),
    targetDate: request.targetDate ?? "",
  };
}

/** Dollars as typed → integer cents, or null when the field is empty. */
export function budgetToCents(budget: string): number | null {
  const trimmed = budget.trim().replace(/[$,]/g, "");
  if (!trimmed) return null;
  const dollars = Number(trimmed);
  if (!Number.isFinite(dollars) || dollars < 0) return null;
  return Math.round(dollars * 100);
}

/** The API's own ceiling on a cents column, so the refusal is a sentence. */
const MAX_CENTS = 2_147_483_647;

/** One sentence naming the first thing wrong, or null when it is sendable. */
export function validateDraft(draft: RequestDraft): string | null {
  if (!draft.title.trim()) return "Give the request a title.";
  if (!draft.serviceType) return "Pick which of our five services this is.";
  const typed = draft.budget.trim().replace(/[$,]/g, "");
  if (typed) {
    const cents = budgetToCents(draft.budget);
    if (cents === null) return "A budget has to be a number, in dollars.";
    if (cents > MAX_CENTS) return "That budget is too big to record.";
  }
  return null;
}

export function draftToPayload(draft: RequestDraft) {
  return {
    title: draft.title.trim(),
    scope: draft.scope.trim() || null,
    serviceType: draft.serviceType || undefined,
    budgetCents: budgetToCents(draft.budget),
    // Sent as the `yyyy-mm-dd` the date input produced. The API reads that
    // form directly and stores it as UTC midnight, which is the same instant
    // `formatDay` reads back — so the date shown is the date picked.
    targetDate: draft.targetDate || null,
  };
}

function Field({
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
      {hint && <p className={cn(CAPTION, "mt-1.5")}>{hint}</p>}
    </div>
  );
}

/** Title, service, scope, needed-by. Budget lives in `MoneyCells`. */
export function RequestFields({
  value,
  onChange,
}: {
  value: RequestDraft;
  onChange: (next: RequestDraft) => void;
}) {
  const set = <K extends keyof RequestDraft>(key: K, next: RequestDraft[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <Field label="What do you want built?">
        <Input
          value={value.title}
          maxLength={255}
          placeholder="Booking site for a client of ours"
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>

      <Field label="Which service">
        <Select
          value={value.serviceType}
          onChange={(e) => set("serviceType", e.target.value as ServiceType)}
        >
          <option value="">Pick one</option>
          {(Object.keys(SERVICE_LABELS) as ServiceType[]).map((key) => (
            <option key={key} value={key}>
              {SERVICE_LABELS[key]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Scope"
        hint="The more you tell us here, the closer the first price will be."
      >
        <Textarea
          rows={6}
          value={value.scope}
          placeholder="What it needs to do, who it is for, anything already decided."
          onChange={(e) => set("scope", e.target.value)}
        />
      </Field>

      <Field label="Needed by" hint="Leave it empty if there's no date yet.">
        <Input
          type="date"
          value={value.targetDate}
          onChange={(e) => set("targetDate", e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * The two money columns, side by side, so the difference between them is the
 * first thing you see rather than a footnote.
 *
 * Left: the budget — an input while the request is still theirs to change,
 * text once it is not. Right: our quote — text, always, and a plain statement
 * that we haven't priced it yet when there is nothing to show.
 */
export function MoneyCells({
  budget,
  onBudgetChange,
  request,
}: {
  budget: string;
  /** Omitted when the request is locked; the cell then renders as text. */
  onBudgetChange?: (next: string) => void;
  /** Null on a request that does not exist yet — there is no quote to show. */
  request: PartnerRequestView | null;
}) {
  // One predicate, in request-view.ts, rather than a status list restated here.
  const showQuote = request !== null && hasQuote(request);
  const budgetCents = budgetToCents(budget);

  return (
    <div className="space-y-2">
      <StatStrip columns={2} ariaLabel="Budget and quote">
        <StatCell label="Your budget">
          {onBudgetChange ? (
            <Input
              inputMode="decimal"
              value={budget}
              placeholder="5000"
              aria-label="Your budget in dollars"
              onChange={(e) => onBudgetChange(e.target.value)}
            />
          ) : budgetCents !== null ? (
            <Stat>{formatMoney(budgetCents)}</Stat>
          ) : (
            <StatEmpty>you haven&apos;t set one.</StatEmpty>
          )}
        </StatCell>

        <StatCell label="Our quote">
          {showQuote && request ? (
            <Stat>{formatMoney(request.quotedCents)}</Stat>
          ) : (
            <StatEmpty>we haven&apos;t quoted this yet.</StatEmpty>
          )}
        </StatCell>
      </StatStrip>
      <p className={CAPTION}>
        You set the budget. We set the quote. They&apos;re allowed to differ —
        that&apos;s the conversation.
      </p>
    </div>
  );
}
