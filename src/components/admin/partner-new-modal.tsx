"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PartnerField, PartnerModal } from "@/components/admin/partner-modal";
import {
  PARTNER_KINDS,
  PARTNER_KIND_LABELS,
  type PartnerKind,
} from "@/lib/partners";

const EMPTY = {
  companyName: "",
  contactName: "",
  email: "",
  kind: "agency" as PartnerKind,
  notes: "",
};

/**
 * Add a partner. We create the record; their login can follow later or never —
 * `userId` is nullable exactly as it is on `agencyClients`, so the commercial
 * relationship exists before the account does.
 */
export function NewPartnerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  /** Receives the new partner's id. */
  onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setError(null);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.companyName.trim() || !form.contactName.trim()) {
      setError("We need a company and a contact name.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          contactName: form.contactName.trim(),
          email: form.email.trim() || null,
          kind: form.kind,
          notes: form.notes.trim() || null,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        // The server's message, not a generic one — it knows why it refused.
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "We could not save that partner."
        );
      }
      if (!body?.id) {
        throw new Error("The partner was not saved — nothing came back.");
      }
      setForm(EMPTY);
      onClose();
      onCreated(body.id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PartnerModal
      open={open}
      title="New Partner"
      description="An agency or affiliate who brings work in. You can invite them to the portal later."
      submitLabel="Create Partner"
      saving={saving}
      error={error}
      onClose={close}
      onSubmit={submit}
    >
      <PartnerField label="Company">
        <Input
          placeholder="Their agency"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        />
      </PartnerField>
      <PartnerField label="Contact">
        <Input
          placeholder="Who you deal with"
          value={form.contactName}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
        />
      </PartnerField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PartnerField
          label="Email"
          hint="Saved now. Nothing is emailed from here."
        >
          <Input
            type="email"
            placeholder="name@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </PartnerField>
        <PartnerField label="Kind">
          <Select
            value={form.kind}
            onChange={(e) =>
              setForm({ ...form, kind: e.target.value as PartnerKind })
            }
          >
            {PARTNER_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {PARTNER_KIND_LABELS[kind]}
              </option>
            ))}
          </Select>
        </PartnerField>
      </div>
      <PartnerField label="Notes">
        <Textarea
          placeholder="How you know them, what they usually bring you."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </PartnerField>
    </PartnerModal>
  );
}
