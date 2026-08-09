"use client";

import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "./reveal";

const faqs = [
  {
    q: "How much does a project actually cost?",
    a: "Funnels start at $1,200, ecommerce stores at $1,800, web applications at $2,500, and AI automation at $3,000. You see your exact fixed quote during onboarding — the price you approve is the price you pay. No hourly billing, no surprise invoices.",
  },
  {
    q: "How fast can I actually get started?",
    a: "Same day. Pick a service, complete the onboarding form (about 8 minutes), review your quote, and submit payment. Your project dashboard and build tracker go live immediately, and the team kicks off discovery within one business day.",
  },
  {
    q: "What does your AI build agent actually do?",
    a: "It works alongside our senior team, not instead of them. The agent handles scaffolding, boilerplate, test suites, and revision churn — the mechanical hours that inflate agency timelines. Every line it produces is reviewed and shaped by a senior builder. You get human judgment on design and architecture, with weeks shaved off delivery.",
  },
  {
    q: "How do I track my project's progress?",
    a: "Your dashboard includes a real-time phase tracker — Discovery, Design, Development, Testing, Review, and Launch — that updates as work progresses. You also get direct messaging with the team, file uploads, and revision requests, all in one place.",
  },
  {
    q: "What if I need changes along the way?",
    a: "Revision rounds are built into every package, and you request them right from your project dashboard. If your scope changes significantly, we re-quote transparently before any extra work starts.",
  },
  {
    q: "Who owns the code when we're done?",
    a: "You do — completely. Full source code, design files, and infrastructure access are handed over at launch. No lock-in, no licensing games.",
  },
];

export function FAQSection() {
  return (
    <section className="bg-cream-dark py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            FAQ
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <Accordion.Item
                key={index}
                value={`faq-${index}`}
                className="overflow-hidden rounded-2xl border border-line bg-paper"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-cream/60 sm:px-6">
                    {faq.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft sm:px-6">
                    {faq.a}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 text-center">
          <p className="text-sm text-ink-soft">
            Can&apos;t find an answer to your question?{" "}
            <Link
              href="/contact"
              className="font-semibold text-orange underline-offset-2 hover:underline"
            >
              Get in touch
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
