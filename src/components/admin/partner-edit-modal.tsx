"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PartnerField, PartnerModal } from "@/components/admin/partner-modal";
import type { PartnerSummary } from "@/components/admin/partner-detail";
import {
  PARTNER_KINDS,
  PARTNER_KIND_LABELS,
  PARTNER_STATUSES,
  PARTNER_STATUS_LABELS,
  type PartnerKind,
  type PartnerStatus,
} from "@/lib/partners";

/** Edit the partner record itself — who they are and whether they are current. */
export function EditPartnerModal({
  open,
  partner,
  onClose,
  onSaved,
}: {
  open: boolean;
  partner: PartnerSummary;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    companyName: partner.companyName,
    contactName: partner.contactName,
    email: partner.email ?? "",
    kind: partner.kind,
    status: partner.status,
    notes: partner.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed when the server sends a fresher row (after a save + refresh).
  useEffect(() => {
    setForm({
      companyName: partner.companyName,
      contactName: partner.contactName,
      email: partner.email ?? "",
      kind: partner.kind,
      status: partner.status,
      notes: partner.notes ?? "",
    });
  }, [partner]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.companyName.trim() || !form.contactName.trim()) {
      setError("We need a company and a contact name.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          contactName: form.contactName.trim(),
          email: form.email.trim() || null,
          kind: form.kind,
          status: form.status,
          notes: form.notes.trim() || null,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "We could not save those changes."
        );
      }
      onClose();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PartnerModal
      open={open}
      title="Edit Partner"
      description="Their details, and whether we are still working with them."
      submitLabel="Save Changes"
      saving={saving}
      error={error}
      onClose={() => {
        setError(null);
        onClose();
      }}
      onSubmit={submit}
    >
      <PartnerField label="Company">
        <Input
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        />
      </PartnerField>
      <PartnerField label="Contact">
        <Input
          value={form.contactName}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
        />
      </PartnerField>
      <PartnerField label="Email">
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </PartnerField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <PartnerField label="Status">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as PartnerStatus })
            }
          >
            {PARTNER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PARTNER_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </PartnerField>
      </div>
      <PartnerField label="Notes">
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </PartnerField>
    </PartnerModal>
  );
}
