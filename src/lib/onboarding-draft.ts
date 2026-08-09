/**
 * The kickoff note Helix "writes" during the onboarding reveal.
 *
 * This is the payoff of the welcome promise ("by the end, I'll already
 * be working on it"). At the final onboarding stage Helix types out a
 * real kickoff note - in the client's chosen update style, naming
 * their business, tuned to their service pick - so the client SEES the
 * agent work before the dashboard ever loads.
 *
 * Why deterministic, not an LLM call. Onboarding is the single
 * highest-stakes first impression in the product. An LLM call here is
 * slow (seconds of dead air), costs money on every signup, and - worst
 * - can misfire on the one screen we cannot afford to get wrong. A
 * template keyed off the client's own inputs is instant, free, and
 * cannot produce a bad sentence. The MAGIC is the live typing
 * animation, not the generation. Keep it here, pure and tested.
 *
 * Everything in this file is a pure function of its inputs - no I/O,
 * no Date.now(), no randomness. That's what makes it unit-testable and
 * what makes the reveal identical every time the client sees it.
 */

export type DraftTone = 'warm' | 'direct';

export interface OnboardingDraftInput {
  /** Client's full name; we use the first token. */
  name: string;
  /** Business name the build is for. */
  businessName: string;
  /** Chosen update style from the voice-pick stage. */
  tone: DraftTone;
  /** Service label from the what-are-we-building stage (e.g. 'A web application'). */
  serviceLabel: string;
  /** Audience values from the who-is-it-for stage (e.g. 'b2c'). */
  audiences: string[];
  /** Feature values from the focus stage (e.g. 'payments'). */
  features: string[];
}

export interface OnboardingDraftResult {
  /** One-line framing shown above the typed draft. */
  frame: string;
  /** The message body that types out, character by character. */
  body: string;
}

/** Feature value → the phrase that reads naturally in "scoping ___ first". */
const FEATURE_PHRASE: Record<string, string> = {
  user_accounts: 'user accounts',
  payments: 'payments & checkout',
  admin_dashboard: 'the admin dashboard',
  ai_assistant: 'the AI assistant',
  automations: 'the automations',
  analytics: 'analytics',
  booking: 'booking & scheduling',
  cms: 'content management',
  notifications: 'email & notifications',
  integrations: 'integrations',
};

/**
 * One audience-aware clause, warm tone only. Keeps the reveal feeling
 * "tuned to me" without over-engineering a combinatorial template.
 * First matching audience wins; absence is fine (clause omitted).
 */
const AUDIENCE_WARM_CLAUSE: Record<string, string> = {
  b2c: " I'll keep every screen simple enough that your customers never have to think.",
  b2b: " I'll keep it crisp and credible — the kind of product a buying committee trusts.",
  local: " I'll make sure local customers can find you, book you, and pay you without friction.",
  members: " I'll make joining, logging in, and staying subscribed feel effortless.",
  internal: " I'll tune it for your team's daily flow — fewer clicks, less training, no manuals.",
  marketplace: " I'll keep both sides of the marketplace moving — supply in, demand through.",
};

/** Pick the client's first name, or a friendly fallback. */
function firstNameOf(name: string): string {
  const t = name.trim().split(/\s+/)[0];
  return t || 'there';
}

/** 'A web application' → 'web application' for mid-sentence use. */
function serviceNoun(label: string): string {
  return label.replace(/^(a|an)\s+/i, '').toLowerCase();
}

/**
 * Compose the onboarding reveal draft. Pure - same inputs always
 * produce the same frame + body.
 */
export function composeOnboardingDraft(input: OnboardingDraftInput): OnboardingDraftResult {
  const firstName = firstNameOf(input.name);
  const business = input.businessName.trim() || 'your business';
  const noun = serviceNoun(input.serviceLabel || 'build');

  // Primary focus = first selected feature. The "starting with X" clause only
  // when we have a natural phrase for it; otherwise the note reads fine without.
  const primaryFeature = input.features[0];
  const featurePhrase = primaryFeature ? FEATURE_PHRASE[primaryFeature] : undefined;
  const startingWith = featurePhrase ? `, starting with ${featurePhrase}` : '';

  const frame = `The moment your project lands on the board, here's the kickoff note I'll post:`;

  if (input.tone === 'direct') {
    // Direct: respect their time, lead with the status, one clear next step.
    const body =
      `Hi ${firstName} — kickoff logged for ${business}. ` +
      `Scope: ${noun}${startingWith}. Next: scaffold, first preview, senior review. ` +
      `I'll ping you the moment the preview link is live. Helix, on the ${business} build`;
    return { frame, body };
  }

  // Warm: open the door, reassure, invite - with one audience-aware touch.
  const audienceClause =
    input.audiences.map((a) => AUDIENCE_WARM_CLAUSE[a]).find(Boolean) ?? '';
  const body =
    `Hi ${firstName}, kickoff for ${business} is on the board! ` +
    `I've read your brief and started laying out the ${noun}${startingWith}.${audienceClause} ` +
    `Your first preview lands soon, and a senior builder reviews everything before it ships. ` +
    `No surprises, ever. Helix, on the ${business} build`;
  return { frame, body };
}

// ── The full trick ────────────────────────────────────────────────────────────
//
// The reveal doesn't stop at the typed note — the trick is the WHOLE job,
// performed once, end to end: read → scope → draft → review → filed. Same
// design rule as the note above: deterministic, pure, instant — the magic is
// the performance, not the generation. These are the real states the project
// will be in when the dashboard loads.

export interface TrickStep {
  key: 'read' | 'scope' | 'draft' | 'review' | 'filed';
  /** Short bold lead-in, e.g. "Scoped the build". */
  label: string;
  /** One quiet explanatory line under it. */
  detail: string;
}

export interface FirstBuildTrick {
  /** The staged lines the reveal animates in, in order. */
  steps: TrickStep[];
}

/**
 * Compose the end-to-end reveal sequence. Pure — same inputs, same trick.
 */
export function composeFirstBuildTrick(input: OnboardingDraftInput): FirstBuildTrick {
  const business = input.businessName.trim() || 'your business';
  const noun = serviceNoun(input.serviceLabel || 'build');
  const primaryFeature = input.features[0];
  const featurePhrase = primaryFeature ? FEATURE_PHRASE[primaryFeature] : undefined;

  return {
    steps: [
      {
        key: 'read',
        label: 'Read the brief',
        detail: `${business} — a ${noun}. Everything you just told me, filed as the working brief.`,
      },
      {
        key: 'scope',
        label: 'Scoped the build',
        detail: featurePhrase
          ? `Phased plan drafted, ${featurePhrase} scoped first — fixed quote, no surprises.`
          : 'Phased plan drafted — fixed quote, no surprises.',
      },
      {
        key: 'draft',
        label: 'Drafted the kickoff',
        detail: `In the ${input.tone} style you picked — you just watched it happen.`,
      },
      {
        key: 'review',
        label: 'Senior review scheduled',
        detail: 'A senior builder signs off on every phase before it ships. The first one is queued.',
      },
      {
        key: 'filed',
        label: 'Filed in Projects',
        detail: 'Your build is on the board right now — first thing you\'ll see when the dashboard loads.',
      },
    ],
  };
}
