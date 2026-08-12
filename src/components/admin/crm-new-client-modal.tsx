"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X } from "lucide-react";
import { CLIENT_OFFERINGS, INDUSTRIES, OFFERING_LABELS } from "@/lib/crm";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  CAPTION,
  H2,
  PRIMARY_PILL,
  TITLE_FONT,
} from "@/lib/typography";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
    </div>
  );
}

/** Create New Client — records the client, seeds the delivery checklist
 * (unassigned), and optionally emails a Clerk portal invitation. */
export function NewClientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const today = () => new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    contactName: "",
    companyName: "",
    email: "",
    industry: "",
    industryCustom: "",
    package: "",
    packageCustom: "",
    setupFee: "",
    monthlyFee: "",
    startDate: today(),
    driveUrl: "",
    landingPageUrl: "",
    notes: "",
    sendInvite: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setForm({
      contactName: "",
      companyName: "",
      email: "",
      industry: "",
      industryCustom: "",
      package: "",
      packageCustom: "",
      setupFee: "",
      monthlyFee: "",
      startDate: today(),
      driveUrl: "",
      landingPageUrl: "",
      notes: "",
      sendInvite: false,
    });
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.contactName.trim() || !form.companyName.trim()) {
      setError("Contact and business name are required.");
      return;
    }
    const industry =
      form.industry === "Custom"
        ? form.industryCustom.trim() || "Custom"
        : form.industry || undefined;
    const pkg = form.package || undefined;
    const cents = (v: string) => Math.round((parseFloat(v) || 0) * 100);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: form.contactName.trim(),
          companyName: form.companyName.trim(),
          email: form.email.trim() || undefined,
          businessType: industry,
          ...(pkg && pkg !== "custom" && { package: pkg }),
          ...(pkg === "custom" && {
            package: "custom",
            packageLabel: form.packageCustom.trim() || "Custom",
          }),
          setupFee: cents(form.setupFee),
          monthlyFee: cents(form.monthlyFee),
          ...(form.notes.trim() && { notes: form.notes.trim() }),
          ...(form.startDate && {
            startDate: new Date(form.startDate + "T00:00:00Z").toISOString(),
          }),
          ...(form.driveUrl.trim() && { driveUrl: form.driveUrl.trim() }),
          ...(form.landingPageUrl.trim() && {
            landingPageUrl: form.landingPageUrl.trim(),
          }),
          sendInvite: form.sendInvite,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "failed");
      }
      reset();
      onClose();
      onCreated();
    } catch {
      setError("Could not create the client — try again.");
    } finally {
      setSaving(false);
    }
  }

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
            onSubmit={submit}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(15,16,16,0.06),0_24px_60px_-16px_rgba(15,16,16,0.3)] sm:p-8"
          >
            <div className="flex items-start justify-between pb-1">
              <h2 className={H2} style={TITLE_FONT}>
                Create New Client
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
            <p className={cn(BODY_MUTED, "pb-6")}>
              A new roster entry — this seeds their delivery checklist.
            </p>

            <div className="space-y-4">
              <Field label="Contact Name">
                <Input
                  placeholder="John Doe"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
                />
              </Field>
              <Field label="Business Name">
                <Input
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />
              </Field>
              <Field label="Login Email">
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <p className={cn(CAPTION, "mt-1.5")}>
                  Saved now, but nothing is emailed unless you tick the box
                  below. You can send the invite later from Client Details.
                </p>
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Industry">
                  <Select
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Select>
                  {form.industry === "Custom" && (
                    <Input
                      className="mt-2"
                      placeholder="Custom industry"
                      value={form.industryCustom}
                      onChange={(e) =>
                        setForm({ ...form, industryCustom: e.target.value })
                      }
                    />
                  )}
                </Field>
                <Field label="Offering">
                  <Select
                    value={form.package}
                    onChange={(e) =>
                      setForm({ ...form, package: e.target.value })
                    }
                  >
                    <option value="">Select offering</option>
                    {CLIENT_OFFERINGS.map((p) => (
                      <option key={p} value={p}>
                        {OFFERING_LABELS[p]}
                      </option>
                    ))}
                  </Select>
                  {form.package === "custom" && (
                    <Input
                      className="mt-2"
                      placeholder="Custom engagement name"
                      value={form.packageCustom}
                      onChange={(e) =>
                        setForm({ ...form, packageCustom: e.target.value })
                      }
                    />
                  )}
                </Field>
                <Field label="Setup Fee ($)">
                  <Input
                    inputMode="decimal"
                    placeholder="1500"
                    value={form.setupFee}
                    onChange={(e) =>
                      setForm({ ...form, setupFee: e.target.value })
                    }
                  />
                </Field>
                <Field label="Monthly Fee ($)">
                  <Input
                    inputMode="decimal"
                    placeholder="500"
                    value={form.monthlyFee}
                    onChange={(e) =>
                      setForm({ ...form, monthlyFee: e.target.value })
                    }
                  />
                </Field>
                <Field label="Date Started">
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field label="Drive Link">
                <Input
                  placeholder="https://drive.google.com/..."
                  value={form.driveUrl}
                  onChange={(e) =>
                    setForm({ ...form, driveUrl: e.target.value })
                  }
                />
              </Field>
              <Field label="Landing Page Link">
                <Input
                  placeholder="https://..."
                  value={form.landingPageUrl}
                  onChange={(e) =>
                    setForm({ ...form, landingPageUrl: e.target.value })
                  }
                />
              </Field>
              <Field label="Notes">
                <Input
                  placeholder="Anything worth remembering about this client"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--foreground)]"
                  checked={form.sendInvite}
                  onChange={(e) =>
                    setForm({ ...form, sendInvite: e.target.checked })
                  }
                />
                <span>
                  <span className="font-medium">Email the portal invite now</span>
                  <span className={cn(CAPTION, "mt-0.5 block")}>
                    Leave off to onboard them internally first — invite when
                    you&apos;re ready for them to log in.
                  </span>
                </span>
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                className={cn(
                  PRIMARY_PILL,
                  "w-full justify-center disabled:opacity-50"
                )}
                disabled={saving}
              >
                {saving
                  ? "Creating…"
                  : form.sendInvite
                    ? "Create Client & Send Invite"
                    : "Create Client"}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
