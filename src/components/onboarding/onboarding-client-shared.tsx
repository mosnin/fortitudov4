'use client';

/**
 * Shared onboarding building blocks - used by the conversational client
 * onboarding (`onboarding-client.tsx`).
 *
 * What lives here: the option constants (services, audiences, features,
 * budget, timeline), the shared primitives, and the small helpers.
 */

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceType } from '@/lib/services';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Tone = 'warm' | 'direct';
export type Budget = 'lt2500' | '2500-10k' | '10k-25k' | '25kplus';
export type Timeline = 'asap' | '1-2mo' | '3-6mo' | 'flexible';

// ── Option constants ────────────────────────────────────────────────────────

/** The five things Fortitudo offers — maps 1:1 onto the API's serviceType. */
export const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'websites', label: 'A website' },
  { value: 'software_solutions', label: 'A software solution' },
  { value: 'ai_solutions', label: 'An AI solution' },
  { value: 'consultation', label: 'A consultation' },
  { value: 'digital_marketing', label: 'Digital marketing' },
];

/** Budget bucket → the string persisted on the onboarding submission. */
export const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: 'lt2500', label: 'Under $2.5K' },
  { value: '2500-10k', label: '$2.5K–$10K' },
  { value: '10k-25k', label: '$10K–$25K' },
  { value: '25kplus', label: '$25K+' },
];

/** Timeline bucket → the string persisted on the onboarding submission. */
export const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-2mo', label: '1–2 months' },
  { value: '3-6mo', label: '3–6 months' },
  { value: 'flexible', label: 'Flexible' },
];

export const AUDIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'b2c', label: 'Consumers (B2C)' },
  { value: 'b2b', label: 'Businesses (B2B)' },
  { value: 'local', label: 'Local customers' },
  { value: 'members', label: 'Members & subscribers' },
  { value: 'internal', label: 'Internal team' },
  { value: 'marketplace', label: 'Marketplace users' },
];

export const FEATURE_OPTIONS: { value: string; label: string; icon?: string }[] = [
  { value: 'user_accounts', label: 'User accounts' },
  { value: 'payments', label: 'Payments & checkout' },
  { value: 'admin_dashboard', label: 'Admin dashboard' },
  { value: 'ai_assistant', label: 'AI assistant' },
  { value: 'automations', label: 'Automations' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'booking', label: 'Booking & scheduling' },
  { value: 'cms', label: 'Content management' },
  { value: 'notifications', label: 'Email & notifications' },
  { value: 'integrations', label: 'Integrations' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function toggleCapped<T>(arr: T[], v: T, cap: number): T[] {
  if (arr.includes(v)) return arr.filter((x) => x !== v);
  if (arr.length >= cap) return arr;
  return [...arr, v];
}

// ── Primitives ───────────────────────────────────────────────────────────────

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function PickerButton({
  selected, onClick, children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm transition-all',
        selected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:bg-foreground/[0.04]',
      )}
    >
      {children}
    </button>
  );
}

/** Primary pill used at the foot of each stage. */
export function StageContinue({
  onClick, disabled, children = 'Continue',
}: {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {children} <ArrowRight size={14} />
      </button>
    </div>
  );
}

export function ErrorLine({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/40 px-3 py-2.5 text-sm text-rose-800 dark:text-rose-200">
      <span>{message}</span>
    </div>
  );
}
