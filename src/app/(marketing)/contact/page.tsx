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
 *
 * The copy — labels, the placeholder, both failure notices, the success state —
 * lives in `src/lib/i18n/dictionaries/contact.ts`, with the `metadata` the
 * sibling `layout.tsx` renders. Field names, validation and the POST are
 * behaviour and stay here; so does the email address, which is not copy.
 */

import { useState } from 'react';
import { CheckCircle, Loader2, Mail, MapPin, Clock, Send } from 'lucide-react';
import { services } from '@/lib/services';
import { Band, BlurRise, PillGhost, Serif } from '@/components/marketing/giga/primitives';
import { ALERT_TEXT, EYEBROW_TEXT, MONO_STYLE, SECTION_Y, TITLE_L } from '@/components/marketing/giga/tokens';
import { PageHero } from '@/components/marketing/giga/page-hero';
import { CONTACT } from '@/lib/i18n/dictionaries/contact';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import type { Lang } from '@/lib/i18n/markets';

const EMPTY = { name: '', email: '', company: '', service: '', message: '' };

/**
 * An address, not copy: it is the same in every language, and a translated
 * inbox does not exist. It interpolates into the two failure notices as
 * `{email}` so no dictionary ever has to carry it.
 */
const CONTACT_EMAIL = 'hello@fortitudo.agency';

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

/** The icons for the three detail rows, in render order. They pair with the
 *  strings in `t.details` below; icons are not copy and do not translate. */
const DETAIL_ICONS = [Mail, Clock, MapPin] as const;

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
export default function ContactPage({ lang = 'en' }: { lang?: Lang }) {
  const t = CONTACT[lang];
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const details = [
    { icon: DETAIL_ICONS[0], title: t.details.emailTitle, body: CONTACT_EMAIL },
    { icon: DETAIL_ICONS[1], title: t.details.responseTitle, body: t.details.responseBody },
    { icon: DETAIL_ICONS[2], title: t.details.locationTitle, body: t.details.locationBody },
  ];

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
          payload.error ?? fill(t.form.errorSend, { email: CONTACT_EMAIL })
        );
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      setError(fill(t.form.errorNetwork, { email: CONTACT_EMAIL }));
      setStatus('idle');
    }
  }

  return (
    <>
      {/* Hero. No `cta`: this page's action is the form, and its yellow submit
          button is the one primary control on the screen. */}
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={
          <>
            {t.hero.titleLead}{' '}
            <span className="text-[var(--fx-yellow)]">{t.hero.titleAccent}</span>
          </>
        }
        lead={t.hero.body}
        seed={4}
      />

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
                      {t.sent.title}
                    </Serif>
                    <p className="mt-2 text-[14px] text-[var(--fx-muted)]">
                      {t.sent.body}
                    </p>
                    <PillGhost
                      href="/contact"
                      className="mt-7"
                      // A link rather than a button: re-mounting the page is
                      // the simplest way to get a genuinely clean form.
                    >
                      {t.sent.again}
                    </PillGhost>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className={LABEL}>
                          {/* The trailing space is inside the expression, not a
                              sibling `{' '}`: two adjacent text children render
                              a separator comment, and this label had one text
                              node before the extraction. */}
                          {`${t.form.nameLabel} `}
                          <span className="text-[var(--fx-yellow)]">*</span>
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
                          {t.form.emailLabel}{' '}
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
                          {t.form.companyLabel}
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
                          {t.form.serviceLabel}
                        </label>
                        <select
                          id="service"
                          className={FIELD}
                          value={form.service}
                          onChange={(e) => set('service')(e.target.value)}
                        >
                          <option value="">{t.form.serviceUnset}</option>
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
                        {t.form.messageLabel}{' '}
                        <span className="text-[var(--fx-yellow)]">*</span>
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={6}
                        maxLength={5000}
                        className={FIELD}
                        placeholder={t.form.messagePlaceholder}
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
                      {t.form.submit}
                    </button>

                    {/* A promise about what happens to their address is
                        content, not decoration, so it reads at --fx-muted's
                        6.5:1 rather than --fx-faint's 3.57:1. */}
                    <p className="text-[12px] text-[var(--fx-muted)]">
                      {t.form.privacyNote}
                    </p>
                  </form>
                )}
              </div>
            </BlurRise>

            {/* Details */}
            <BlurRise delay={0.08} className="lg:col-span-2">
              <div className="border-t border-[var(--fx-hairline)]">
                {details.map((detail) => (
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
                  {t.start.title}
                </Serif>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
                  {t.start.body}
                </p>
                <PillGhost href="/sign-up" className="mt-5 w-full">
                  {t.start.cta}
                </PillGhost>
              </div>
            </BlurRise>
          </div>
        </Band>
      </section>
    </>
  );
}
