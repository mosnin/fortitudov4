"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { EASE_OUT, Reveal } from "./reveal";
import { PillLink } from "./pill-link";

const stories = [
  {
    initials: "SM",
    name: "Sarah Mitchell",
    role: "Founder, Maison Noir",
    quote:
      "Our store shipped in three weeks and conversion tripled. I always knew exactly where the build stood.",
    tone: "from-[#2A2A28] to-[#111110]",
  },
  {
    initials: "MG",
    name: "Maria Gonzalez",
    role: "Ops Lead, HelpStream",
    quote:
      "The automation they built saves us 20+ hours a week. They understood our workflow better than we did.",
    tone: "from-[#33312D] to-[#161513]",
  },
  {
    initials: "JO",
    name: "James Okafor",
    role: "CEO, GrowthForge",
    quote:
      "We needed a funnel fast and got 450% ROI on ad spend. Already planning the next build with them.",
    tone: "from-[#2E2B26] to-[#131211]",
  },
  {
    initials: "PS",
    name: "Priya Shah",
    role: "Founder, Atlas Ops",
    quote:
      "Figma to production in five weeks. I checked the build tracker more often than my email.",
    tone: "from-[#292824] to-[#141412]",
  },
];

export function FoundersSection() {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              Built for founders{" "}
              <span className="font-serif italic font-normal">who ship</span>
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              Why startups get built with Fortitudo.
            </p>
          </div>
          <PillLink href="/portfolio" variant="ink">
            Read customer stories
            <ArrowRight className="h-4 w-4" />
          </PillLink>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story, index) => (
            <motion.figure
              key={story.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-64px" }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-paper transition-shadow duration-300 hover:shadow-[0_20px_50px_-20px_rgba(26,26,24,0.25)]"
            >
              {/* Monochrome portrait block */}
              <div
                className={`relative flex aspect-[4/3.4] items-end overflow-hidden bg-gradient-to-br ${story.tone} p-4`}
              >
                <span
                  aria-hidden
                  className="absolute -top-6 -right-3 font-serif text-[10rem] leading-none text-white/[0.09] transition-transform duration-500 group-hover:scale-105"
                >
                  {story.initials.charAt(0)}
                </span>
                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-sm font-bold text-cream backdrop-blur-sm">
                    {story.initials}
                  </span>
                </div>
              </div>

              <blockquote className="flex flex-1 flex-col p-5">
                <p className="text-sm leading-relaxed text-ink">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <figcaption className="mt-auto pt-4">
                  <p className="text-sm font-semibold text-ink">{story.name}</p>
                  <p className="text-xs text-ink-soft">{story.role}</p>
                </figcaption>
              </blockquote>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
