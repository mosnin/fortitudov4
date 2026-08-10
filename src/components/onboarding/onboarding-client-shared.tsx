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

// ── Shared stages ────────────────────────────────────────────────────────────
// Ported verbatim from the reference's onboarding stages: same layout, same
// classes, same affordances. Only the questions and options are ours.

export function StageWhoYouServe({
  audiences, requirements, onToggleAudience, onChangeRequirements, onContinue,
}: {
  audiences: string[];
  requirements: string;
  onToggleAudience: (v: string) => void;
  onChangeRequirements: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl tracking-tight text-foreground" style={{ fontFamily: 'var(--font-title)' }}>
          Who is this being built for?
        </h2>
        <p className="text-sm text-muted-foreground">Pick up to 3. I&apos;ll shape the build and my recommendations around them.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AUDIENCE_OPTIONS.map((opt) => {
          const selected = audiences.includes(opt.value);
          const atCap = !selected && audiences.length >= 3;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={atCap}
              onClick={() => onToggleAudience(opt.value)}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-foreground/[0.04]',
                atCap && 'opacity-40 cursor-not-allowed',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <Section label="Anything the build must have - or must avoid? (optional)">
        <textarea
          value={requirements}
          onChange={(e) => onChangeRequirements(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder='e.g. "Must integrate with our Stripe account. Never send marketing email from the app."'
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Section>

      <StageContinue onClick={onContinue} disabled={audiences.length === 0} />
    </div>
  );
}

export function StageVoice({
  name, businessName, tone, onPick,
}: {
  name: string;
  businessName: string;
  tone: Tone | null;
  onPick: (t: Tone) => void;
}) {
  const firstName = (name.trim().split(/\s+/)[0]) || 'me';
  const business = businessName.trim() || 'your team';

  const warm = `Morning! The checkout flow is live on your preview link - I walked it end to end this morning and it feels quick. Want me to send a short clip so you can see it before we call? No rush either way. - Helix, for ${firstName} at ${business}`;
  const direct = `Preview updated. Checkout flow is live: 3 steps, Stripe wired, 1.2s to first paint. Two open items - refund copy and the mobile nav. Review link is in your dashboard. - Helix, for ${firstName} at ${business}`;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl tracking-tight text-foreground" style={{ fontFamily: 'var(--font-title)' }}>
          Which one sounds more like you?
        </h2>
        <p className="text-sm text-muted-foreground">
          Here are two ways I could send you a build update. Pick the one you&apos;d rather get - I&apos;ll match it from here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VoiceCard label="Warm" body={warm} selected={tone === 'warm'} onClick={() => onPick('warm')} />
        <VoiceCard label="Direct" body={direct} selected={tone === 'direct'} onClick={() => onPick('direct')} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        You can change this later in Settings.
      </p>
    </div>
  );
}

function VoiceCard({
  label, body, selected, onClick,
}: {
  label: string;
  body: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-left rounded-xl border p-5 transition-all',
        // Paper-flat: ring, not shadow, on the selected card.
        selected
          ? 'border-foreground bg-foreground/[0.04] ring-2 ring-foreground/10 ring-offset-2 ring-offset-background'
          : 'border-border bg-background hover:bg-foreground/[0.04]',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">{label}</p>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{body}</p>
    </button>
  );
}

export function StageSources({
  features, onToggle, onContinue,
}: {
  features: string[];
  onToggle: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl tracking-tight text-foreground" style={{ fontFamily: 'var(--font-title)' }}>
          What should we build first?
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick the one or two that matter most - that&apos;s where we&apos;ll start. Everything else can come later.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {FEATURE_OPTIONS.map((opt) => {
          const selected = features.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                'rounded-xl border px-3 py-3 text-sm font-medium transition-all flex flex-col items-center gap-2',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-foreground/[0.04]',
              )}
            >
              <span className={cn('w-6 h-6 rounded-md inline-flex items-center justify-center text-xs font-semibold', selected ? 'bg-background/20' : 'bg-muted text-muted-foreground')}>
                {opt.label[0]}
              </span>
              <span className="leading-tight text-center">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <StageContinue onClick={onContinue}>
        {features.length === 0 ? 'Skip for now' : 'Continue'}
      </StageContinue>
    </div>
  );
}
