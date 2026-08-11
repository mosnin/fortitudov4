'use client';

/**
 * `/faq` — the questions founders actually ask.
 *
 * Moved into the `(marketing)` group and rebuilt on the racing-yellow system;
 * it used to carry its own `<Header/>`/`<Footer/>` on the old orange template.
 * Every question and answer below is unchanged — only the chrome moved.
 */

import { ChevronDown } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import {
  Band,
  BlurRise,
  Eyebrow,
  PillPrimary,
  Serif,
} from '@/components/marketing/giga/primitives';
import { CtaSection } from '@/components/marketing/giga/cta';

const MONO = { fontFamily: 'var(--font-mono)' } as const;

const faqCategories = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How does the process work?",
        a: "It's simple: choose a service, create your account, complete a quick onboarding form with your project details, and submit payment. Once confirmed, you'll get access to your project dashboard where you can track every phase of the build in real-time.",
      },
      {
        q: "How long does a typical project take?",
        a: "Timelines vary by service and complexity. Funnels and landing pages typically take 2-3 weeks. Web applications and ecommerce stores range from 3-6 weeks. Custom enterprise projects are scoped individually. You'll see your specific timeline during onboarding.",
      },
      {
        q: "What information do I need to provide?",
        a: "During onboarding, we'll ask about your business, target audience, desired features, brand guidelines, and any specific requirements. The more detail you provide, the better we can tailor the build to your needs.",
      },
      {
        q: "Can I start a project without knowing exactly what I need?",
        a: "Absolutely. Our discovery phase is designed to help clarify your requirements. You can also book a free consultation through our contact page and we'll help you figure out the best approach.",
      },
    ],
  },
  {
    category: "Pricing & Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We process payments securely through Creem.io, which supports all major credit cards, debit cards, and select digital payment methods.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No hidden fees. The price you see during onboarding is the price you pay. If your project scope changes significantly, we'll discuss any adjustments transparently before proceeding.",
      },
      {
        q: "Do you offer refunds?",
        a: "We offer a satisfaction guarantee through our revision process. If you're not happy with a deliverable, we'll work with you to make it right. Refund policies are outlined in our terms of service.",
      },
      {
        q: "Can I pay in installments?",
        a: "For enterprise projects, we offer milestone-based payment plans. Contact us to discuss payment options for your specific project.",
      },
    ],
  },
  {
    category: "Project Management",
    questions: [
      {
        q: "How do I track my project's progress?",
        a: "Your dashboard includes a real-time phase tracker (similar to DoorDash order tracking) that shows exactly where your project stands. Each phase — Discovery, Design, Development, Testing, Review, and Launch — updates as work progresses.",
      },
      {
        q: "How many revisions are included?",
        a: "Revision rounds depend on your plan: Starter includes 1 round, Professional includes 3 rounds, and Enterprise includes unlimited revisions. You can request revisions directly through your project dashboard.",
      },
      {
        q: "Can I upload files and assets?",
        a: "Yes! Your project page has a built-in file upload section where you can share brand assets, content documents, images, and any other files relevant to your project.",
      },
      {
        q: "How do I communicate with the team?",
        a: "Every project includes a direct messaging feature. You can chat with our team in real-time through your dashboard — no need for external email threads or Slack channels.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "What technologies do you use?",
        a: "We use modern, industry-standard technologies including Next.js, React, TypeScript, Tailwind CSS, and various backend services depending on your project's needs. All projects are built for performance, scalability, and maintainability.",
      },
      {
        q: "Will I own the code?",
        a: "Yes. Once your project is complete and payment is finalized, you have full ownership of all code, designs, and assets created for your project.",
      },
      {
        q: "Do you provide hosting?",
        a: "We can deploy to your preferred hosting provider (Vercel, AWS, etc.) or recommend the best option for your project. Hosting costs are separate from our development fees.",
      },
      {
        q: "What about ongoing maintenance?",
        a: "All plans include post-launch support (7-90 days depending on your plan). For ongoing maintenance, we offer separate support agreements — contact us for details.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.10),transparent_55%)]"
        />
        <Band innerClassName="relative max-w-3xl">
          <BlurRise trigger="load">
            <Eyebrow>FAQ</Eyebrow>
            <Serif
              as="h1"
              className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.04] text-[var(--fx-white)]"
            >
              Frequently asked{' '}
              <span className="text-[var(--fx-yellow)]">questions.</span>
            </Serif>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              Everything you need to know about working with Fortitudo Agency.
              Can&apos;t find what you&apos;re looking for? Reach out directly.
            </p>
          </BlurRise>
        </Band>
      </section>

      {/* Questions, by category */}
      <section className="border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] py-20 sm:py-28">
        <Band innerClassName="max-w-3xl">
          <div className="space-y-16">
            {faqCategories.map((category) => (
              <BlurRise key={category.category}>
                <p
                  style={MONO}
                  className="text-[11px] tracking-[0.18em] text-[var(--fx-faint)] uppercase"
                >
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
                        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--fx-faint)] transition-transform duration-200" />
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

      {/* Still stuck */}
      <section className="border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal-deep)] py-20 sm:py-24">
        <Band innerClassName="max-w-2xl">
          <BlurRise>
            <Serif className="text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.08] text-[var(--fx-white)]">
              Still have questions?
            </Serif>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--fx-muted)]">
              We&apos;re here to help. Reach out and we&apos;ll get back to you
              within 24 hours.
            </p>
            <PillPrimary href="/contact" className="mt-8" withArrow>
              Contact us
            </PillPrimary>
          </BlurRise>
        </Band>
      </section>

      <CtaSection />
    </>
  );
}
