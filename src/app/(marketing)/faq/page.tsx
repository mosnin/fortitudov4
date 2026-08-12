'use client';

/**
 * `/faq` — the questions founders actually ask.
 *
 * Moved into the `(marketing)` group and rebuilt on the racing-yellow system;
 * it used to carry its own `<Header/>`/`<Footer/>` on the old orange template.
 *
 * The answers sell only what `src/lib/services.ts` lists: five offerings, no
 * plan tiers. Answers that quoted Starter/Professional/Enterprise revision
 * allowances, enterprise payment plans, funnel timelines and a 7–90 day support
 * window were describing a product that does not exist — every number here is
 * now traceable to `services.ts`, `crm.ts` or the terms of service, and the
 * ones that were not have been replaced with what we actually commit to.
 */

import { ChevronDown } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { Band, BlurRise, Eyebrow, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import { DISPLAY_L, DISPLAY_S, EYEBROW_TEXT, HERO_Y, MONO_STYLE, SECTION_Y } from '@/components/marketing/giga/tokens';
import { CtaSection } from '@/components/marketing/giga/cta';
import { ToneShift } from '@/components/marketing/giga/tone-shift';

const faqCategories = [
  {
    category: "Getting started",
    questions: [
      {
        q: "How does it work?",
        a: "Pick what you need. Make an account. Answer a few questions about your project. Pay. Your project page opens, and you can see every stage of the build from there.",
      },
      {
        q: "How long does it take?",
        a: "It depends what you are building — a marketing site is not the same job as an app or an AI build. We work out your dates along with your price, and you see both before you agree to anything.",
      },
      {
        q: "What do you need from me?",
        a: "What your business does, who you sell to, what you want the thing to do, and your logo and brand files if you have them. The more you tell us, the closer the first version will be.",
      },
      {
        q: "What if I do not know what I need yet?",
        a: "That is normal. The first stage is us working it out with you. You can also send us a note first, and we will help you decide before you pay anything.",
      },
    ],
  },
  {
    category: "Price & payment",
    questions: [
      {
        q: "How can I pay?",
        a: "Through Creem.io. It takes all the major credit and debit cards, and some digital wallets.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No. The price you see before you pay is the price you pay. If you want something outside what we agreed to build, we price that first and you decide.",
      },
      {
        q: "Do you offer refunds?",
        a: "If you do not like what we made, we fix it through the revision rounds in your project. Fees are not refundable unless we have agreed otherwise in writing. The full wording is in our terms of service.",
      },
      {
        q: "Can I pay in parts?",
        a: "Payment is due before work starts, as our terms of service set out. For a bigger build, talk to us before you approve the price.",
      },
    ],
  },
  {
    category: "Running your project",
    questions: [
      {
        q: "How do I see how it is going?",
        a: "Your project page shows the stage you are in, a bit like tracking a food delivery. Discovery, Design, Development, Testing, Review, and Launch. It moves as we work.",
      },
      {
        q: "How many changes do I get?",
        a: "The rounds are written into what you approve before we start. Changes inside that cost you nothing extra. Ask for them on your project page.",
      },
      {
        q: "Can I send you files?",
        a: "Yes. Your project page has a place to upload logos, photos, text, and anything else we need.",
      },
      {
        q: "How do I talk to you?",
        a: "There is a message box on your project page. You write there, we answer there. No email chains, no Slack channels.",
      },
    ],
  },
  {
    category: "The tech",
    questions: [
      {
        q: "What is it built with?",
        a: "Next.js, React, TypeScript and Tailwind CSS, plus whatever your project needs behind them. All of it is standard, so another team could pick it up later.",
      },
      {
        q: "Do I own it?",
        a: "Yes. Once the work is done and paid for, the code, the designs, and the files we made are all yours.",
      },
      {
        q: "Do you host it?",
        a: "We can put it wherever you want — Vercel, AWS, or somewhere else — or tell you what suits your project. Hosting is billed by them, not by us.",
      },
      {
        q: "What happens after launch?",
        a: "Every project comes with 30 days of help after launch. If you want us to keep working on it after that, we agree that separately.",
      },
    ],
  },
];

export default function FAQPage() {
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
            <Eyebrow>FAQ</Eyebrow>
            <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
              Frequently asked{' '}
              <span className="text-[var(--fx-yellow)]">questions.</span>
            </Serif>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              The things people ask us before they start. Can&apos;t find
              yours? Send us a note and we will answer it.
            </p>
          </BlurRise>
        </Band>
      </section>

      {/* The tone shift. Everything below runs in the inverted scope — racing
          yellow ground, black ink — see `[data-fx-tone="light"]` in
          globals.css.

          The split is directly under the hero, which is the whole pitch this
          page has: four words of promise, and then sixteen answers. Everything
          below the hero is the substance, so the substance is what turns
          yellow.

          The obvious alternative — splitting after the questions, the way the
          homepage splits before its proof — was tried and rejected. The
          section that follows the accordions paints `--fx-charcoal-deep`,
          which inverts to black, so the flip would land on a black band and
          the page would show no yellow at all until the closing ask. A tone
          shift that produces no tone is not one. */}
      <ToneShift>
        {/* Questions, by category */}
        <section className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
          <Band innerClassName="max-w-3xl">
            <div className="space-y-16">
              {faqCategories.map((category) => (
                <BlurRise key={category.category}>
                  <p style={MONO_STYLE} className={EYEBROW_TEXT}>
                    {category.category}
                  </p>

                  <Accordion.Root
                    type="single"
                    collapsible
                    className="mt-5 border-t border-[var(--fx-hairline)]"
                  >
                    {category.questions.map((item, i) => (
                      <Accordion.Item
                        key={item.q}
                        value={`${category.category}-${i}`}
                        className="border-b border-[var(--fx-hairline)]"
                      >
                        <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-[16px] font-medium text-[var(--fx-white)] transition-colors [&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-[var(--fx-yellow)]">
                          {item.q}
                          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--fx-muted)] transition-transform duration-200" />
                        </Accordion.Trigger>
                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                          <div className="pb-5 text-[14px] leading-relaxed text-[var(--fx-muted)]">
                            {item.a}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </BlurRise>
              ))}
            </div>
          </Band>
        </section>

        {/* Still stuck. `--fx-charcoal-deep` inverts to black, so this band is
            a full-width black plate on the yellow and its ink has to flip
            back — hence the surface mark. */}
        <section
          data-fx-surface="dark"
          className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal-deep)] ${SECTION_Y}`}
        >
          <Band innerClassName="max-w-2xl">
            <BlurRise>
              <Serif className={`${DISPLAY_S} text-[var(--fx-white)]`}>
                Still have questions?
              </Serif>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--fx-muted)]">
                Send us a note. We answer within 24 hours.
              </p>
              <PillPrimary href="/contact" className="mt-8" withArrow>
                Contact us
              </PillPrimary>
            </BlurRise>
          </Band>
        </section>

        <CtaSection />
      </ToneShift>
    </>
  );
}
