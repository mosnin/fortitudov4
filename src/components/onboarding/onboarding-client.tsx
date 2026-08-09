'use client';

/**
 * Client onboarding - the conversational flow.
 *
 * The client doesn't fill out a form; they have a conversation with Helix,
 * inside an interface that looks and moves exactly like the product they're
 * about to live in. Three acts:
 *
 *   Act I  (intro)  - a cinematic cold open (OnboardingIntro): a title line,
 *                     the Fortitudo mark, then a blur-out into the chat.
 *   Act II (chat)   - Helix types each question; the client answers through
 *                     real inline inputs rendered as their own chat bubbles.
 *   Act III (ready) - Helix types the real kickoff note (the payoff), then
 *                     a closing preloader (OnboardingReady) flashes a few
 *                     working-words → "Your account is ready." → the dashboard.
 *
 * Persistence: one POST to `/api/onboarding` at the end of the conversation
 * with the payload that endpoint expects (serviceType, businessName,
 * industry, website, description, targetAudience, timeline, budget,
 * features, additionalNotes). On success the closing preloader plays and the
 * client lands on /dashboard.
 */

import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HELIX_PILL } from '@/lib/typography';
import { BrandLogo } from '@/components/brand-logo';
import { composeOnboardingDraft, composeFirstBuildTrick } from '@/lib/onboarding-draft';
import type { ServiceType } from '@/lib/services';
import { OnboardingIntro, OnboardingReady } from './onboarding-cinematics';
import { HelixSays, UserSays, AnswerAffordance, Thread } from './onboarding-chat';
import { TypingText } from './typing-text';
import {
  type Tone, type Budget, type Timeline,
  toggle, toggleCapped,
  PickerButton,
  SERVICE_OPTIONS, BUDGET_OPTIONS, TIMELINE_OPTIONS,
  AUDIENCE_OPTIONS, FEATURE_OPTIONS,
} from './onboarding-client-shared';

interface Props {
  defaultName: string;
  /** Optional service preselected from a marketing link (?service=…). */
  initialService?: ServiceType | null;
}

type Phase = 'intro' | 'chat' | 'ready';

/** Conversation steps, in order. Bookended by the cinematics, not in here. */
type Step =
  | 'greet' | 'name' | 'service' | 'business' | 'basics'
  | 'promise' | 'audience' | 'voice' | 'features' | 'reveal';

const ORDER: Step[] = [
  'greet', 'name', 'service', 'business', 'basics',
  'promise', 'audience', 'voice', 'features', 'reveal',
];

export function OnboardingClient({ defaultName, initialService = null }: Props) {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('intro');

  // Conversation position.
  const [stepIdx, setStepIdx] = useState(0);
  const [typedDone, setTypedDone] = useState(false);
  const current = ORDER[stepIdx];

  // Identity + build.
  const [name, setName] = useState(defaultName || '');
  const [service, setService] = useState<ServiceType | null>(initialService);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [budget, setBudget] = useState<Budget | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);

  // Brief.
  const [audiences, setAudiences] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<Tone | null>(null);
  const [features, setFeatures] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Where to land once the closing preloader finishes.
  const redirectRef = useRef<string | null>(null);

  const firstName = (name.trim().split(/\s+/)[0]) || 'there';

  const serviceLabel = SERVICE_OPTIONS.find((o) => o.value === service)?.label ?? 'A build';

  // ── Navigation ──────────────────────────────────────────────────────────────

  const advance = useCallback(() => {
    setStepIdx((i) => Math.min(i + 1, ORDER.length - 1));
    setTypedDone(false);
    setError(null);
  }, []);

  // Greet has no input - once Helix finishes saying hello, glide to the
  // first question after a short beat.
  useEffect(() => {
    if (current !== 'greet' || !typedDone) return;
    const t = setTimeout(advance, 650);
    return () => clearTimeout(t);
  }, [current, typedDone, advance]);

  // ── Persistence ─────────────────────────────────────────────────────────────

  // reveal "take me in" → one POST with the whole brief, then hand off to the
  // closing preloader, which redirects to the dashboard when it finishes.
  const handleFinish = useCallback(async () => {
    if (!service) return;
    setSubmitting(true);
    setError(null);
    try {
      const site = website.trim();
      const audienceLabels = audiences
        .map((v) => AUDIENCE_OPTIONS.find((o) => o.value === v)?.label)
        .filter(Boolean)
        .join(', ');
      const notes = [
        name.trim() && `Contact name: ${name.trim()}.`,
        tone && `Preferred update style: ${tone}.`,
      ].filter(Boolean).join(' ');

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: service,
          businessName: businessName.trim(),
          industry: industry.trim() || undefined,
          website: site ? (/^https?:\/\//i.test(site) ? site : `https://${site}`) : undefined,
          description: description.trim() || undefined,
          targetAudience: audienceLabels || undefined,
          timeline: TIMELINE_OPTIONS.find((o) => o.value === timeline)?.label,
          budget: BUDGET_OPTIONS.find((o) => o.value === budget)?.label,
          features,
          additionalNotes: notes || undefined,
        }),
      });
      if (!res.ok) throw new Error('complete');
      const { projectId } = (await res.json()) as { projectId?: string };

      // Payment step comes next — the project is created, checkout binds it.
      redirectRef.current = projectId
        ? `/checkout?projectId=${projectId}`
        : '/dashboard';
      setPhase('ready');
    } catch {
      setError("Couldn't finish setup. Usually temporary.");
      setSubmitting(false);
    }
  }, [service, businessName, industry, website, description, audiences, timeline, budget, features, name, tone]);

  // ── Copy ──────────────────────────────────────────────────────────────────────

  const promptFor = useCallback((s: Step): string => {
    switch (s) {
      case 'greet': return "I'm Helix, your new build companion. From here on, I'm working right alongside you.";
      case 'name': return 'First, what should I call you?';
      case 'service': return `Good to meet you, ${firstName}. What are we building?`;
      case 'business': return 'Tell me about the business this build is for.';
      case 'basics': return 'Two practical things: rough budget, and when you need this live.';
      case 'promise': return 'Before we go further, one promise: I draft, a senior builder approves. Nothing ships without a human sign-off.';
      case 'audience': return "Who is this for? Pick up to three and I'll tune everything to them.";
      case 'voice': return 'Your build comes with progress updates. Which reply sounds like the updates you want?';
      case 'features': return "Where should I focus first? Pick your top one or two. That's what I'll scope first.";
      case 'reveal': return `That's everything I need, ${firstName}. Now watch. Here's the kickoff note for your build.`;
    }
  }, [firstName]);

  // The client's answer bubble for a completed step. null = no bubble.
  const answerFor = useCallback((s: Step): string | null => {
    switch (s) {
      case 'name': return name.trim() || null;
      case 'service': return service ? SERVICE_OPTIONS.find((o) => o.value === service)?.label ?? null : null;
      case 'business': {
        const b = businessName.trim();
        if (!b) return null;
        return industry.trim() ? `${b} · ${industry.trim()}` : b;
      }
      case 'basics': {
        const bLabel = BUDGET_OPTIONS.find((o) => o.value === budget)?.label;
        const tLabel = TIMELINE_OPTIONS.find((o) => o.value === timeline)?.label;
        return bLabel && tLabel ? `${bLabel} · ${tLabel}` : null;
      }
      case 'audience': {
        const labels = audiences
          .map((v) => AUDIENCE_OPTIONS.find((o) => o.value === v)?.label)
          .filter(Boolean);
        return labels.length ? labels.join(', ') : null;
      }
      case 'voice': return tone ? (tone === 'warm' ? 'Warm' : 'Direct') : null;
      case 'features': {
        const labels = features
          .map((v) => FEATURE_OPTIONS.find((o) => o.value === v)?.label)
          .filter(Boolean);
        return labels.length ? labels.join(', ') : "We'll scope this together later.";
      }
      default: return null;
    }
  }, [name, service, businessName, industry, budget, timeline, audiences, tone, features]);

  // ── Cinematics ──────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return <OnboardingIntro onDone={() => setPhase('chat')} />;
  }

  // ── The conversation ──────────────────────────────────────────────────────────

  return (
    <>
      <motion.div
        className="relative min-h-screen w-full overflow-hidden bg-background text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Neutral stage - monochrome canvas, matching the onboarding shell. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
        />

        {/* Fixed brand mark - the chat's quiet header. */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex justify-center bg-gradient-to-b from-background to-transparent pt-6 pb-8">
          <BrandLogo className="h-5 opacity-80" alt="Fortitudo" textClassName="text-sm" />
        </div>

        <div className="relative z-[1]">
          <Thread signal={`${stepIdx}:${typedDone}`}>
            {/* Past turns. */}
            {ORDER.slice(0, stepIdx).map((id) => {
              const answer = answerFor(id);
              return (
                <Fragment key={id}>
                  <HelixSays text={promptFor(id)} />
                  {answer && <UserSays>{answer}</UserSays>}
                </Fragment>
              );
            })}

            {/* Active turn - Helix types, then the answer affordance fades in. */}
            <HelixSays
              key={`active-${current}`}
              text={promptFor(current)}
              active
              typing
              onTyped={() => setTypedDone(true)}
            />

            {current !== 'greet' && (
              <AnswerAffordance show={typedDone}>
                {renderAffordance()}
              </AnswerAffordance>
            )}
          </Thread>
        </div>
      </motion.div>

      {phase === 'ready' && (
        <OnboardingReady
          onDone={() => {
            if (redirectRef.current) router.push(redirectRef.current);
          }}
        />
      )}
    </>
  );

  // ── Affordances ───────────────────────────────────────────────────────────────

  function renderAffordance() {
    switch (current) {
      case 'name':
        return (
          <NameAffordance value={name} onChange={setName} onContinue={() => name.trim() && advance()} />
        );

      case 'service':
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {SERVICE_OPTIONS.map((opt) => (
              <PickerButton
                key={opt.value}
                selected={service === opt.value}
                onClick={() => { setService(opt.value); setTimeout(advance, 360); }}
              >
                <span className="font-medium">{opt.label}</span>
              </PickerButton>
            ))}
          </div>
        );

      case 'business':
        return (
          <BusinessAffordance
            businessName={businessName}
            industry={industry}
            website={website}
            submitting={submitting}
            error={error}
            onChangeBusinessName={setBusinessName}
            onChangeIndustry={setIndustry}
            onChangeWebsite={setWebsite}
            onContinue={advance}
          />
        );

      case 'basics':
        return (
          <BasicsAffordance
            budget={budget}
            timeline={timeline}
            submitting={submitting}
            error={error}
            onChangeBudget={setBudget}
            onChangeTimeline={setTimeline}
            onContinue={advance}
          />
        );

      case 'promise':
        return (
          <div className="flex justify-end">
            <button type="button" onClick={advance} className={HELIX_PILL}>
              Got it <ArrowRight size={14} />
            </button>
          </div>
        );

      case 'audience':
        return (
          <AudienceAffordance
            audiences={audiences}
            description={description}
            onToggle={(v) => setAudiences((prev) => toggleCapped(prev, v, 3))}
            onChangeDescription={setDescription}
            onContinue={advance}
          />
        );

      case 'voice':
        return (
          <VoiceAffordance
            businessName={businessName}
            tone={tone}
            onPick={(t) => { setTone(t); setTimeout(advance, 360); }}
          />
        );

      case 'features':
        return (
          <FeaturesAffordance
            features={features}
            onToggle={(v) => setFeatures((prev) => toggle(prev, v))}
            onContinue={advance}
          />
        );

      case 'reveal':
        return (
          <RevealAffordance
            name={name}
            businessName={businessName}
            tone={tone ?? 'warm'}
            serviceLabel={serviceLabel}
            audiences={audiences}
            features={features}
            submitting={submitting}
            error={error}
            onFinish={handleFinish}
          />
        );

      default:
        return null;
    }
  }
}

// ── Affordance pieces ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-medium text-muted-foreground">{children}</p>;
}

function ErrorLine({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2.5 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
      {message}
    </div>
  );
}

const INPUT_CLS =
  'w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-ring';

function SubmitPill({
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
        className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {children} <ArrowRight size={14} />
      </button>
    </div>
  );
}

function NameAffordance({
  value, onChange, onContinue,
}: {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        autoComplete="name"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) onContinue(); }}
        placeholder="Sarah Chen"
        className={INPUT_CLS}
      />
      <SubmitPill onClick={onContinue} disabled={!value.trim()} />
    </div>
  );
}

function BusinessAffordance({
  businessName, industry, website, submitting, error,
  onChangeBusinessName, onChangeIndustry, onChangeWebsite, onContinue,
}: {
  businessName: string;
  industry: string;
  website: string;
  submitting: boolean;
  error: string | null;
  onChangeBusinessName: (v: string) => void;
  onChangeIndustry: (v: string) => void;
  onChangeWebsite: (v: string) => void;
  onContinue: () => void;
}) {
  const canContinue = !submitting && businessName.trim().length > 0;
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Business name</FieldLabel>
        <input
          type="text"
          autoFocus
          value={businessName}
          onChange={(e) => onChangeBusinessName(e.target.value)}
          placeholder="Coastal Coffee Co."
          className={INPUT_CLS}
        />
      </div>
      <div>
        <FieldLabel>What space are you in?</FieldLabel>
        <input
          type="text"
          value={industry}
          onChange={(e) => onChangeIndustry(e.target.value)}
          placeholder="Coaching, home services, SaaS…"
          className={INPUT_CLS}
        />
      </div>
      <div>
        <FieldLabel>Website (optional)</FieldLabel>
        <input
          type="text"
          inputMode="url"
          value={website}
          onChange={(e) => onChangeWebsite(e.target.value)}
          placeholder="yourbusiness.com"
          className={cn(INPUT_CLS, 'font-mono text-sm')}
        />
        <p className="mt-1.5 break-all text-xs text-muted-foreground">
          If you have one, I&apos;ll pull brand cues and copy from it.
        </p>
      </div>
      {error && <ErrorLine message={error} />}
      <SubmitPill onClick={onContinue} disabled={!canContinue} />
    </div>
  );
}

function BasicsAffordance({
  budget, timeline, submitting, error, onChangeBudget, onChangeTimeline, onContinue,
}: {
  budget: Budget | null;
  timeline: Timeline | null;
  submitting: boolean;
  error: string | null;
  onChangeBudget: (b: Budget) => void;
  onChangeTimeline: (t: Timeline) => void;
  onContinue: () => void;
}) {
  const canContinue = !submitting && budget !== null && timeline !== null;
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Rough budget</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BUDGET_OPTIONS.map((opt) => (
            <PickerButton key={opt.value} selected={budget === opt.value} onClick={() => onChangeBudget(opt.value)}>
              <span className="font-medium">{opt.label}</span>
            </PickerButton>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>When do you need it live?</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIMELINE_OPTIONS.map((opt) => (
            <PickerButton key={opt.value} selected={timeline === opt.value} onClick={() => onChangeTimeline(opt.value)}>
              <span className="font-medium">{opt.label}</span>
            </PickerButton>
          ))}
        </div>
      </div>
      {error && <ErrorLine message={error} />}
      <SubmitPill onClick={onContinue} disabled={!canContinue}>
        {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Continue'}
      </SubmitPill>
    </div>
  );
}

function AudienceAffordance({
  audiences, description, onToggle, onChangeDescription, onContinue,
}: {
  audiences: string[];
  description: string;
  onToggle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {AUDIENCE_OPTIONS.map((opt) => {
          const selected = audiences.includes(opt.value);
          const atCap = !selected && audiences.length >= 3;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={atCap}
              onClick={() => onToggle(opt.value)}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-foreground/[0.04]',
                atCap && 'cursor-not-allowed opacity-40',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div>
        <FieldLabel>What should this build do? Goals, must-haves, anything on your mind. (optional)</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder='e.g. "A booking platform for my studio — clients pick a slot, pay a deposit, and get reminders."'
          className={cn(INPUT_CLS, 'resize-none text-sm')}
        />
      </div>
      <SubmitPill onClick={onContinue} disabled={audiences.length === 0} />
    </div>
  );
}

function VoiceAffordance({
  businessName, tone, onPick,
}: {
  businessName: string;
  tone: Tone | null;
  onPick: (t: Tone) => void;
}) {
  const business = businessName.trim() || 'your build';
  const warm = `Hi! Great progress this week — the main screens are in and checkout is next up. I put a fresh preview link in your portal; take a look whenever suits, no rush. More soon! Helix, on the ${business} build`;
  const direct = `Hi — status: Phase 2 of 4. Main screens done, checkout in progress, preview updated 6:10pm. Blockers: none. Senior review Tue or Wed — which works? Helix, on the ${business} build`;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <VoiceCard label="Warm" body={warm} selected={tone === 'warm'} onClick={() => onPick('warm')} />
      <VoiceCard label="Direct" body={direct} selected={tone === 'direct'} onClick={() => onPick('direct')} />
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
        'rounded-xl border p-5 text-left transition-all',
        selected
          ? 'border-foreground bg-foreground/[0.04] ring-2 ring-foreground/10 ring-offset-2 ring-offset-background'
          : 'border-border bg-background hover:bg-foreground/[0.04]',
      )}
    >
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{body}</p>
    </button>
  );
}

function FeaturesAffordance({
  features, onToggle, onContinue,
}: {
  features: string[];
  onToggle: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {FEATURE_OPTIONS.map((opt) => {
          const selected = features.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-foreground/[0.04]',
              )}
            >
              {opt.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opt.icon} alt="" aria-hidden className="h-6 w-6 object-contain" />
              ) : (
                <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold', selected ? 'bg-background/20' : 'bg-muted text-muted-foreground')}>
                  {opt.label[0]}
                </span>
              )}
              <span className="text-center leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <SubmitPill onClick={onContinue}>
        {features.length === 0 ? 'Skip for now' : 'Continue'}
      </SubmitPill>
    </div>
  );
}

function RevealAffordance({
  name, businessName, tone, serviceLabel, audiences, features, submitting, error, onFinish,
}: {
  name: string;
  businessName: string;
  tone: Tone;
  serviceLabel: string;
  audiences: string[];
  features: string[];
  submitting: boolean;
  error: string | null;
  onFinish: () => void;
}) {
  const draft = composeOnboardingDraft({ name, businessName, tone, serviceLabel, audiences, features });
  const trick = composeFirstBuildTrick({ name, businessName, tone, serviceLabel, audiences, features });
  const [typed, setTyped] = useState(false);
  // How many trick steps have appeared. The draft typing IS the 'draft' step
  // performed live, so the staged list starts after typing completes and
  // reveals one line at a time — the whole job, not one piece of it.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!typed || shown >= trick.steps.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 500 : 900);
    return () => clearTimeout(t);
  }, [typed, shown, trick.steps.length]);

  const done = shown >= trick.steps.length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/70 bg-card p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Draft · {tone === 'warm' ? 'Warm' : 'Direct'}
        </p>
        <p className="min-h-[7.5rem] text-sm leading-relaxed text-foreground">
          <TypingText text={draft.body} onDone={() => setTyped(true)} />
        </p>
      </div>

      {/* The rest of the job, performed in sequence. Each line lands with the
          same quiet fade the thread uses; no spinners, no theatre — these are
          the real states the build will be in when the dashboard loads. */}
      {typed && (
        <ol className="space-y-2.5">
          {trick.steps.slice(0, shown).map((step) => (
            <li
              key={step.key}
              className="flex items-start gap-2.5 duration-500 animate-in fade-in slide-in-from-bottom-1"
            >
              <Check size={14} className="mt-0.5 shrink-0 text-foreground" strokeWidth={2.5} />
              <span className="text-sm leading-snug">
                <span className="font-medium text-foreground">{step.label}</span>
                <span className="block text-[13px] text-muted-foreground">{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {error && <ErrorLine message={error} />}
      <div className={cn('flex justify-end transition-opacity duration-500', done ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        <button type="button" onClick={onFinish} disabled={submitting} className={HELIX_PILL}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <>It&rsquo;s on the board — take me in <ArrowRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}
