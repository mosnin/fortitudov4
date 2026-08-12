"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PartnerField, PartnerModal } from "@/components/admin/partner-modal";
import { SERVICE_LABELS, type ServiceType } from "@/lib/services";

const OFFERINGS = Object.keys(SERVICE_LABELS) as ServiceType[];

const EMPTY = {
  title: "",
  serviceType: "websites" as ServiceType,
  targetDate: "",
};

/**
 * Open a request on a partner's behalf.
 *
 * This is the same object a partner creates themselves — one table, one noun —
 * opened in `draft` with the scope and budget left blank for them to fill in.
 * `createdBy` records that we opened it, which is the whole of the difference
 * between the two directions of that door (plans/partners.md).
 *
 * The scope and budget fields are missing on purpose: the budget is the
 * partner's number, and typing it for them is how it stops being theirs.
 */
export function NewPartnerRequestModal({
  open,
  partnerId,
  partnerName,
  onClose,
  onCreated,
}: {
  open: boolean;
  partnerId: string;
  partnerName: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Give the request a title so they know what it refers to.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/partner-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId,
          title: form.title.trim(),
          serviceType: form.serviceType,
          status: "draft",
          targetDate: form.targetDate
            ? new Date(`${form.targetDate}T00:00:00Z`).toISOString()
            : null,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "We could not open that request."
        );
      }
      if (!body?.id) {
        throw new Error("The request was not saved — nothing came back.");
      }
      setForm(EMPTY);
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PartnerModal
      open={open}
      title="Open a Request"
      description={`A draft for ${partnerName}. You name the job; they fill in the scope and their budget.`}
      submitLabel="Open Request"
      saving={saving}
      error={error}
      onClose={() => {
        setError(null);
        onClose();
      }}
      onSubmit={submit}
    >
      <PartnerField
        label="Title"
        hint="What you agreed to look at — enough for them to recognise it."
      >
        <Input
          placeholder="Rebuild for their client"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </PartnerField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PartnerField label="Offering">
          <Select
            value={form.serviceType}
            onChange={(e) =>
              setForm({ ...form, serviceType: e.target.value as ServiceType })
            }
          >
            {OFFERINGS.map((service) => (
              <option key={service} value={service}>
                {SERVICE_LABELS[service]}
              </option>
            ))}
          </Select>
        </PartnerField>
        <PartnerField label="Needed by" hint="Optional.">
          <Input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          />
        </PartnerField>
      </div>
      <p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
        It opens as a draft. The scope and the budget stay blank — those are
        theirs to state, and we answer with a quote.
      </p>
    </PartnerModal>
  );
}
