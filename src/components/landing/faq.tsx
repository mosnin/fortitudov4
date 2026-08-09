"use client";

import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { SectionRails } from "./section-rails";

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
    <section className="relative border-b border-line bg-cream px-4 py-16 md:px-6 md:py-20 lg:px-16">
      <SectionRails />

      <div className="relative mx-auto flex w-full max-w-[840px] flex-col gap-10">
        <h2 className="px-6 text-center font-mono text-[28px] leading-none font-medium tracking-[-0.032em] text-ink md:text-[40px] lg:text-[48px]">
          FAQ
        </h2>

        <Accordion.Root type="single" collapsible className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <Accordion.Item
              key={index}
              value={`faq-${index}`}
              className="overflow-hidden rounded-[12px] border border-line bg-white"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left text-[16px] font-medium tracking-[-0.015em] text-ink transition-colors hover:bg-surface md:px-6">
                  {faq.q}
                  <Plus className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 group-data-[state=open]:rotate-45" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <p className="px-5 pb-5 text-[15px] leading-[1.5] tracking-[-0.015em] text-ink-soft md:px-6">
                  {faq.a}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        <p className="text-center text-[15px] tracking-[-0.015em] text-ink-soft">
          Can&apos;t find an answer to your question?{" "}
          <Link
            href="/contact"
            className="font-medium text-ink underline underline-offset-4 hover:text-orange"
          >
            Get in touch
          </Link>
        </p>
      </div>
    </section>
  );
}
