// Delivered by Originkit · stack: nextjs
"use client";

/* Every image in this file is a decorative sub-24px SVG glyph or a tiled noise
 * texture. next/image would add a layout wrapper and an optimizer round-trip
 * to assets that are already smaller than the request to fetch them, so these
 * stay plain <img>. */
/* eslint-disable @next/next/no-img-element */

import ASCIIWaves from "@/components/originkit/ui/character-waves";
import { DashboardCard } from "@/components/originkit/ui/hero-21/dashboard-card";
import { Reveal, RevealGroup } from "@/components/originkit/ui/hero-21/reveal";
import { services } from "@/lib/services";

/** Public asset under /sections/hero-21/assets */
function asset(file: string) {
  return `/originkit/hero-21/${file}`;
}

/**
 * The section this replaces was a strip of seven invented client logos. We do
 * not have client logos to show, and inventing them on a real agency's site is
 * a lie — so the slot carries the five things we actually sell instead.
 */
const OFFERINGS = services.map((service) => service.name);

/**
 * The kit shipped its own nav inside the hero. It is gone: the site already
 * has one header (`SiteHeader`), which carries the real menus and the mobile
 * takeover, and two navs stacked on the homepage is the kind of thing you only
 * notice once and then cannot stop noticing. What survives from the kit's
 * chrome is the noise strip, which was never navigation — it is the texture
 * that separates the header from the headline.
 */
export const Section25Hero = () => (
  <main className="relative min-h-dvh w-full overflow-hidden bg-[var(--fx-charcoal)]">
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[1920px] flex-col px-5 pt-[72px] ipad:px-8 ipad:pt-[84px] desktop-sm:px-[50px] desktop-sm:pt-[88px]">
      <div className="relative desktop-sm:border-b desktop-sm:border-[var(--fx-hairline)]">
        <div
          aria-hidden
          className="h-7 w-full opacity-25 mix-blend-plus-lighter ipad:h-[37px]"
          style={{
            backgroundImage: `url(${asset("nav-noise.png")})`,
            backgroundSize: "239.6px 240px",
          }}
        />
      </div>

      {/* Rails — the two vertical hairlines framing the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-5 top-[110px] bottom-0 border-x border-[var(--fx-hairline)] ipad:inset-x-8 ipad:top-[128px] desktop-sm:inset-x-[50px] desktop-sm:top-[132px]"
      />

      {/* Two-column split from desktop-sm: copy left, wave field right */}
      <div className="desktop-sm:grid desktop-sm:grid-cols-[729fr_612fr]">
        <div className="desktop-sm:border-r desktop-sm:border-[var(--fx-hairline)]">
          {/* Hero copy */}
          <section className="relative flex flex-col gap-8 px-3 pt-6 ipad:gap-[50px] ipad:px-[30px] ipad:pt-[42px] desktop-sm:pt-[82.5px]">
            <RevealGroup className="flex flex-col gap-3" delay={0.15}>
              <Reveal className="flex items-center gap-2">
                <img
                  src={asset("badge-dot.svg")}
                  alt=""
                  width={14}
                  height={14}
                  className="size-[14px]" />
                <p className="font-mono text-[13px] leading-[1.5] font-medium tracking-[-0.26px] text-[var(--fx-white)] ipad:text-[15px] ipad:tracking-[-0.3px]">
                  A DIGITAL AGENCY, NOT A QUEUE
                </p>
              </Reveal>

              <Reveal>
                <h1 className="font-sans text-[34px] leading-[1.1] font-semibold tracking-[-0.68px] text-[var(--fx-white)] ipad:text-[54px] ipad:tracking-[-1.08px]">
                  We build it. <br />
                  <span className="text-[var(--fx-yellow)]">Helix keeps it moving.</span>
                </h1>
              </Reveal>

              <Reveal>
                <p className="w-[326px] font-sans text-[16px] leading-[1.5] font-medium tracking-[-0.32px] text-[var(--fx-muted)] ipad:w-[507px] ipad:text-[18px] ipad:tracking-[-0.36px]">
                  Websites, software, AI and marketing — built by people who
                  ship. Our agent works your account around the clock, and
                  nothing reaches you until someone here has approved it.
                </p>
              </Reveal>

              <Reveal className="mt-5 flex items-center gap-[18px] ipad:mt-[38px]">
                <a
                  href="/onboarding"
                  className="flex w-[137px] cursor-pointer items-center justify-center rounded-[4px] bg-[var(--fx-yellow)] px-6 py-4 font-sans text-[18px] leading-normal font-medium tracking-[-0.36px] whitespace-nowrap text-[var(--fx-on-yellow)] transition-colors duration-300 ease-out [@media(hover:hover)]:hover:bg-[var(--fx-yellow-hover)]"
                >
                  Start Building
                </a>

                <a
                  href="/portfolio"
                  className="group flex cursor-pointer items-center justify-center gap-px rounded-[10px] py-[13px]"
                >
                  <span className="font-sans text-[15px] leading-[1.5] font-medium tracking-[-0.3px] whitespace-nowrap text-[var(--fx-faint)]">
                    See our work
                  </span>
                  <span className="relative block size-[22px] overflow-hidden transition-transform duration-300 ease-out group-hover:translate-x-[3px]">
                    <span className="absolute inset-[28.66%_35.7%_23.78%_35.72%] block">
                      <img
                        src={asset("arrow.svg")}
                        alt=""
                        className="absolute inset-0 size-full max-w-none object-contain"
                      />
                    </span>
                  </span>
                </a>
              </Reveal>
            </RevealGroup>
          </section>

          {/* What we build — the five offerings, in place of the kit's logo wall */}
          <section className="relative mt-6 border-t desktop-sm:border-y border-[var(--fx-hairline)] p-5 ipad:mt-[50px] ipad:px-[30px] ipad:py-[50px] desktop-sm:mt-[51.5px]">
            <Reveal>
              <p className="font-mono text-[14px] leading-[1.5] font-medium tracking-[0.14px] text-[var(--fx-muted)] uppercase">
                What We Build
              </p>
            </Reveal>

            <RevealGroup
              delay={0.05}
              stagger={0.07}
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3 ipad:max-w-[600px] desktop-sm:max-w-[570px]"
            >
              {OFFERINGS.map((offering) => (
                <Reveal key={offering}>
                  <a
                    href="/services"
                    className="block rounded-[4px] border border-[var(--fx-hairline)] px-3 py-2 font-sans text-[13px] leading-none font-medium whitespace-nowrap text-[var(--fx-white)] transition-colors duration-200 ease-out ipad:text-[15px] [@media(hover:hover)]:hover:border-[var(--fx-yellow)] [@media(hover:hover)]:hover:text-[var(--fx-yellow)]"
                  >
                    {offering}
                  </a>
                </Reveal>
              ))}
            </RevealGroup>
          </section>
        </div>

        {/* ASCII wave field — height follows the dashboard card plus its padding */}
        <div className="relative desktop-sm:min-h-full">
          <div
            aria-hidden
            className="absolute inset-0 border desktop-sm:border-r desktop-sm:border-l-0 desktop-sm:border-t-0 desktop-sm:border-b border-[var(--fx-hairline)]"
          >
            <ASCIIWaves
              characters=" .:-+*=%@#"
              elementSize={12}
              color="var(--fx-yellow)"
              background="var(--fx-charcoal)"
              direction="left"
              speed={16}
              waveTension={5}
              noiseScale={12}
              intensity={10}
              fontWeight="500"
              hasCursorInteraction
              interactionIntensity={15}
              interactionRadius={160}
            />
          </div>

          <div className="pointer-events-none relative flex items-center justify-center px-[17px] py-[33px] ipad:py-[42px] desktop-sm:h-full desktop-sm:min-h-[579px] desktop-sm:py-0">
            <Reveal className="pointer-events-auto">
              <DashboardCard />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  </main>
);
