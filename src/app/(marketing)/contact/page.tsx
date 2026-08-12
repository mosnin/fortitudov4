'use client';

/**
 * `/contact` — the lead form.
 *
 * Two things changed here, and the second matters more than the redesign.
 *
 * The form did not submit anywhere. It waited a second on a `setTimeout`, then
 * rendered "Message sent! We'll get back to you within 24 hours." Every
 * prospect who filled it in was told they had been heard, and nothing was
 * recorded. It now POSTs to `/api/leads`, which writes a row to the `leads`
 * table the admin CRM already reads from — and when that call fails it says so
 * and leaves the message in the box, instead of clearing the form and
 * claiming success.
 */

import { useState } from 'react';
import { CheckCircle, Loader2, Mail, MapPin, Clock, Send } from 'lucide-react';
import { services } from '@/lib/services';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from '@/components/marketing/giga/primitives';
import { ALERT_TEXT, DISPLAY_L, EYEBROW_TEXT, HERO_Y, MONO_STYLE, SECTION_Y, TITLE_L } from '@/components/marketing/giga/tokens';

const EMPTY = { name: '', email: '', company: '', service: '', message: '' };

// The resting border is --fx-faint rather than --fx-hairline: the hairline is
// 1.4:1 on charcoal, and WCAG 1.4.11 asks 3:1 of any boundary that is what
// identifies a control. --fx-faint measures 3.6:1, and it is the same token
// PillGhost draws its edge with, so every control on the surface has one
// boundary value. Placeholder is --fx-muted (6.5:1): in the textarea it is the
// only hint of what to write. Yellow focus border unchanged.
const FIELD =
  'w-full rounded-[4px] border border-[var(--fx-faint)] bg-[var(--fx-charcoal-raised)] px-3.5 py-2.5 text-[14px] text-[var(--fx-white)] placeholder:text-[var(--fx-muted)] transition-colors focus:border-[var(--fx-yellow)] focus:outline-none';

const LABEL =
  'mb-1.5 block text-[13px] font-medium text-[var(--fx-muted)]';

const DETAILS = [
  {
    icon: Mail,
    title: 'Email',
    body: 'hello@fortitudo.agency',
  },
  {
    icon: Clock,
    title: 'Response time',
    body: 'We typically respond within 24 hours on business days.',
  },
  {
    icon: MapPin,
    title: 'Location',
    body: 'Remote-first agency, serving clients worldwide.',
  },
];

/**
 * No tone shift on this page, deliberately, for two reasons.
 *
 * The page is a hero and one grid row. There is no turn from pitch to proof to
 * mark — the form is both, and the only split available would flip the ask
 * itself, which is the one thing here that has to stay a familiar object.
 *
 * The second reason is a hard one. The failure notice draws on `--fx-alert`
 * and `--fx-alert-text`, and the `[data-fx-surface="dark"]` reset in
 * globals.css does not redefine either. Inside the flip the form card is
 * black, while the alert tokens still hold the dark red picked to survive on
 * yellow — #8c0f24 on #141416, about 2:1. The one message on this site a
 * visitor must not miss would be the one they cannot read. Fix the tokens
 * first; then this page can turn yellow.
 */
export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        // The form is deliberately NOT cleared here — what they wrote is the
        // only copy, and losing it is worse than the failure itself.
        setError(
          payload.error ??
            'We could not send that. Please email us directly at hello@fortitudo.agency.'
        );
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      setError(
        'We could not reach the server. Please email us directly at hello@fortitudo.agency.'
      );
      setStatus('idle');
    }
  }

  return (
    <>
      {/* Hero */}
      <section
        className={`relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${HERO_Y}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.10),transparent_55%)]"
        />
        <Band innerClassName="relative max-w-3xl">
          <BlurRise trigger="load">
            <Eyebrow>Contact</Eyebrow>
            <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
              Let&apos;s talk about{' '}
              <span className="text-[var(--fx-yellow)]">your project.</span>
            </Serif>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              Have a question or ready to start? Send us a note and we&apos;ll
              get back to you within 24 hours.
            </p>
          </BlurRise>
        </Band>
      </section>

      <section className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
        <Band innerClassName="max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Form */}
            <BlurRise className="lg:col-span-3">
              <div className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6 sm:p-8">
                {status === 'sent' ? (
                  <div className="py-10">
                    <CheckCircle className="mb-4 h-10 w-10 text-[var(--fx-yellow)]" />
                    <Serif className={`${TITLE_L} text-[var(--fx-white)]`}>
                      Message received.
                    </Serif>
                    <p className="mt-2 text-[14px] text-[var(--fx-muted)]">
                      It&apos;s in our queue. We&apos;ll get back to you within
                      24 hours.
                    </p>
                    <PillGhost
                      href="/contact"
                      className="mt-7"
                      // A link rather than a button: re-mounting the page is
                      // the simplest way to get a genuinely clean form.
                    >
                      Send another
                    </PillGhost>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className={LABEL}>
                          Name <span className="text-[var(--fx-yellow)]">*</span>
                        </label>
                        <input
                          id="name"
                          required
                          maxLength={255}
                          className={FIELD}
                          value={form.name}
                          onChange={(e) => set('name')(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className={LABEL}>
                          Email{' '}
                          <span className="text-[var(--fx-yellow)]">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          maxLength={255}
                          className={FIELD}
                          value={form.email}
                          onChange={(e) => set('email')(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="company" className={LABEL}>
                          Company
                        </label>
                        <input
                          id="company"
                          maxLength={255}
                          className={FIELD}
                          value={form.company}
                          onChange={(e) => set('company')(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="service" className={LABEL}>
                          What you need
                        </label>
                        <select
                          id="service"
                          className={FIELD}
                          value={form.service}
                          onChange={(e) => set('service')(e.target.value)}
                        >
                          <option value="">Not sure yet</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className={LABEL}>
                        Message{' '}
                        <span className="text-[var(--fx-yellow)]">*</span>
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={6}
                        maxLength={5000}
                        className={FIELD}
                        placeholder="What are you building, and what would make it a success?"
                        value={form.message}
                        onChange={(e) => set('message')(e.target.value)}
                      />
                    </div>

                    {error && (
                      <p
                        role="alert"
                        className={`rounded-[4px] border border-[var(--fx-alert)]/40 bg-[var(--fx-alert)]/[0.08] px-3.5 py-2.5 text-[13px] ${ALERT_TEXT}`}
                      >
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-[var(--fx-yellow)] px-6 text-[14px] font-medium text-[var(--fx-on-yellow)] transition-colors duration-200 hover:bg-[var(--fx-yellow-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === 'sending' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send message
                    </button>

                    {/* A promise about what happens to their address is
                        content, not decoration, so it reads at --fx-muted's
                        6.5:1 rather than --fx-faint's 3.57:1. */}
                    <p className="text-[12px] text-[var(--fx-muted)]">
                      No spam. We&apos;ll respond within 24 hours.
                    </p>
                  </form>
                )}
              </div>
            </BlurRise>

            {/* Details */}
            <BlurRise delay={0.08} className="lg:col-span-2">
              <div className="border-t border-[var(--fx-hairline)]">
                {DETAILS.map((detail) => (
                  <div
                    key={detail.title}
                    className="flex items-start gap-4 border-b border-[var(--fx-hairline)] py-6"
                  >
                    <detail.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fx-yellow)]"
                      strokeWidth={1.75}
                    />
                    <div>
                      <p style={MONO_STYLE} className={EYEBROW_TEXT}>
                        {detail.title}
                      </p>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--fx-white)]">
                        {detail.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[6px] border border-dashed border-[var(--fx-hairline)] p-6">
                <Serif className={`${TITLE_L} text-[var(--fx-white)]`}>
                  Prefer to jump right in?
                </Serif>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
                  Skip the form and start your project through the platform.
                  You&apos;ll answer the same questions, in a conversation.
                </p>
                <PillGhost href="/sign-up" className="mt-5 w-full">
                  Create an account
                </PillGhost>
              </div>
            </BlurRise>
          </div>
        </Band>
      </section>
    </>
  );
}
