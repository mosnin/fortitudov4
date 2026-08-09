"use client";

import { PressButton } from "./press-button";
import { SectionRails } from "./section-rails";
import { ImagePlaceholder } from "./image-placeholder";

const stories = [
  {
    name: "Sarah Mitchell",
    role: "Founder, Maison Noir",
    quote:
      "Our store shipped in three weeks and conversion tripled. I always knew exactly where the build stood.",
  },
  {
    name: "David Chen",
    role: "CTO, DataPulse",
    quote:
      "No back-and-forth emails, no mystery timelines. Everything was right there in the dashboard.",
  },
  {
    name: "Maria Gonzalez",
    role: "Ops Lead, HelpStream",
    quote:
      "The automation they built saves us 20+ hours a week. They understood our workflow better than we did.",
  },
  {
    name: "James Okafor",
    role: "CEO, GrowthForge",
    quote:
      "We needed a funnel fast and got 450% ROI on ad spend. Already planning the next build.",
  },
  {
    name: "Priya Shah",
    role: "Founder, Atlas Ops",
    quote:
      "Figma to production in five weeks. I checked the build tracker more often than my email.",
  },
];

export function FoundersSection() {
  return (
    <section className="relative border-b border-line bg-cream py-16 md:py-20">
      <SectionRails />

      <div className="relative mx-auto max-w-[1600px]">
        <div className="flex flex-col items-start justify-between gap-6 px-4 md:px-6 lg:flex-row lg:items-end lg:px-16">
          <div className="flex flex-col items-start gap-4 md:gap-6">
            <h2 className="font-mono text-[28px] leading-none font-medium tracking-[-0.032em] text-ink md:text-[40px] lg:text-[48px]">
              Built for{" "}
              <span className="pr-2.5 font-serif italic font-normal md:pr-5">
                Founders
              </span>
              Who Ship
            </h2>
            <p className="text-[18px] leading-[120%] tracking-[-0.015em] text-ink-soft md:text-[20px]">
              Why startups get built with Fortitudo.
            </p>
          </div>
          <PressButton href="/portfolio" variant="dark" size="lg">
            Read customer stories
          </PressButton>
        </div>
      </div>

      {/* Draggable-feel card strip with hairline frame and edge fade */}
      <div className="relative mt-8 w-full select-none">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-line" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-line" />

        <div
          className="overflow-hidden py-6"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0, black 3%, black 97%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 3%, black 97%, transparent 100%)",
          }}
        >
          <div
            className="flex w-max animate-marquee gap-4 will-change-transform md:gap-6"
            style={{ "--marquee-duration": "55s" } as React.CSSProperties}
          >
            {[...stories, ...stories].map((story, i) => (
              <article
                key={`${story.name}-${i}`}
                aria-hidden={i >= stories.length}
                className="flex h-[440px] w-[320px] shrink-0 flex-col overflow-clip rounded-[24px] border border-line bg-white md:h-[480px] md:w-[382px]"
              >
                {/* Nested photo card — tilts on hover */}
                <div className="relative -mx-px -mt-px flex h-[260px] shrink-0 flex-col justify-end overflow-clip rounded-[24px] border border-line bg-ink p-4 shadow-[0px_0px_16px_0px_rgba(25,25,25,0.3)] transition-transform duration-300 ease-out hover:-rotate-[1.2deg] md:h-[300px]">
                  <ImagePlaceholder
                    dark
                    label={`Portrait photo — ${story.name} (B&W)`}
                    className="absolute inset-0 rounded-none border-0"
                  />
                  <span className="relative w-fit rounded-[6px] bg-white/95 px-2.5 py-1.5 text-[12px] leading-none font-medium text-ink">
                    {story.name}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="text-[16px] leading-[1.4] tracking-[-0.015em] text-ink">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-[14px] font-medium tracking-[-0.015em] text-ink">
                      {story.name}
                    </p>
                    <p className="text-[13px] tracking-[-0.015em] text-ink-soft">
                      {story.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
