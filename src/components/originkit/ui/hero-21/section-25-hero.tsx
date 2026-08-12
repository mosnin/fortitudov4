"use client";

/**
 * The homepage hero.
 *
 * Rebuilt as a single centred column on a full-bleed ground. What went:
 *
 *  - The ASCII wave field and the floating dashboard card. Together they were
 *    a product screenshot, and this is an agency — the thing being sold is the
 *    build, not a piece of software you log into.
 *  - Every mention of the internal agent. It still runs the agency behind the
 *    login; it is not what a prospect is buying, and naming it here made the
 *    page read as a SaaS landing page.
 *
 * The glow is drawn, not photographed. The reference this follows used a
 * planet-limb photograph; we have no such asset and will not invent one, so
 * the arc is CSS — offset radial gradients plus a hairline rim, in the one
 * accent the system has. It costs nothing to load and it moves with the
 * palette.
 *
 * Motion, in the order you notice it (see `giga/motion-kit.tsx`):
 *
 *  1. The headline assembles itself — words rising out of clipped line boxes
 *     (`KineticText`), which is the surface's signature move and is spent
 *     here and on section headings, nowhere else.
 *  2. Everything around it fades up on the existing stagger, a beat apart.
 *  3. The glow drifts (`Parallax`). It is the only thing on the page tied to
 *     scroll position, and it is decoration, which is the only thing that
 *     should be.
 *  4. The yellow CTA leans toward the cursor (`useMagnetic`, via the shared
 *     pill). "See our work" does not — one magnetic thing per screen.
 */

import { Reveal, RevealGroup } from "@/components/originkit/ui/hero-21/reveal";
import { motion, useReducedMotion } from "motion/react";
import { services } from "@/lib/services";
import { Serif } from "@/components/marketing/giga/primitives";
import { KineticText, Parallax, useMagnetic } from "@/components/marketing/giga/motion-kit";
import { DISPLAY_XL, EYEBROW_TEXT, HERO_Y, MONO_STYLE } from "@/components/marketing/giga/tokens";

/** The five things we sell, read from the module the product prices from. */
const OFFERINGS = services.map((service) => service.name);

export const Section25Hero = () => {
  const reduce = useReducedMotion();
  const magnetic = useMagnetic<HTMLAnchorElement>();

  return (
    <section
      className={`relative isolate flex min-h-dvh w-full flex-col items-center overflow-hidden bg-[var(--fx-charcoal-deep)] px-5 sm:px-8 ${HERO_Y}`}
    >
      {/* ── The drawn glow ────────────────────────────────────────────────────
          A wide arc sweeping up from the lower right. A broad warm bloom, a
          tighter core, and a thin bright rim where the two meet — the rim is
          what stops it reading as a plain vignette. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* The whole arc drifts down as the page scrolls up, so it sits behind
            the copy rather than travelling with it. Only the drawn light moves;
            the dot grid stays pinned, because a texture that slides is a texture
            you notice. */}
        <Parallax className="absolute inset-0" distance={110}>
          {/* The body of the limb: a broad bloom, then a hot core pushed further
              off-canvas so only its bright edge reaches the frame. */}
          <div className="absolute inset-0 bg-[radial-gradient(125%_95%_at_112%_112%,rgba(248,205,2,0.30),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(85%_65%_at_106%_106%,rgba(248,205,2,0.62),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(55%_42%_at_103%_103%,rgba(255,232,120,0.85),transparent_46%)]" />
          {/* A cool lift at the top so the upper half is not flat black. */}
          <div className="absolute inset-0 bg-[radial-gradient(150%_120%_at_50%_-30%,rgba(255,255,255,0.05),transparent_55%)]" />
          {/* The rim, in two passes: a wide blurred halo and a hairline core on
              top of it. One ring alone reads as a drawn stroke; the pair reads as
              something glowing behind the frame. */}
          <div className="absolute -right-[48%] -bottom-[58%] h-[150vh] w-[150vh] rounded-full border-[6px] border-[rgba(248,205,2,0.55)] blur-[26px]" />
          <div className="absolute -right-[48%] -bottom-[58%] h-[150vh] w-[150vh] rounded-full border border-[rgba(255,240,170,0.95)] shadow-[0_0_60px_8px_rgba(248,205,2,0.45)]" />
        </Parallax>
        {/* Fine dot grid — the same texture the footer panel uses. */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] opacity-[0.18] [background-size:22px_22px]" />
      </div>
  
      <RevealGroup
        className="flex w-full max-w-3xl flex-col items-center text-center"
        delay={0.1}
      >
        <Reveal>
          <a
            href="/pricing"
            /* The one circle on the surface that is not a dot or an avatar: the
               hero badge, which the system keeps as its single pill. */
            className="inline-flex items-center gap-3 rounded-full border border-[var(--fx-faint)] bg-[var(--fx-white)]/[0.06] py-1.5 pr-5 pl-1.5 backdrop-blur-md transition-colors duration-200 hover:border-[var(--fx-yellow)]"
          >
            <span className="rounded-full bg-[var(--fx-yellow)] px-3 py-1 text-[12px] font-semibold text-[var(--fx-on-yellow)]">
              Fixed quotes
            </span>
            <span className="text-[13.5px] font-medium text-[var(--fx-white)] sm:text-[14px]">
              The price you approve is the price you pay
            </span>
          </a>
        </Reveal>
  
        {/* Not wrapped in <Reveal>: the headline runs its own mask reveal, and a
            blur-rise around it would be a second curve on the same element. The
            delay places it between the badge and the paragraph in the group's
            cascade. */}
        <Serif as="h1" className={`mt-8 ${DISPLAY_XL} text-[var(--fx-white)]`}>
          <KineticText
            trigger="load"
            delay={0.18}
            lines={['Built by people', 'who ship.']}
          />
        </Serif>
  
        <Reveal>
          <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-[var(--fx-muted)] sm:text-[18px]">
            Websites, software, AI and digital marketing for founders who need it
            done properly the first time. A senior team, a fixed quote, and a
            dashboard that shows you exactly where your build stands.
          </p>
        </Reveal>
  
        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <motion.a
            href="/onboarding"
            {...magnetic}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="group inline-flex items-center gap-2 rounded-[4px] bg-[var(--fx-yellow)] px-7 py-4 text-[16px] font-medium tracking-[-0.01em] text-[var(--fx-on-yellow)] transition-colors duration-200 hover:bg-[var(--fx-yellow-hover)]"
          >
            Start a project
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </motion.a>
  
          <a
            href="/portfolio"
            className="group inline-flex items-center gap-2 text-[16px] font-medium text-[var(--fx-white)] transition-colors duration-200 hover:text-[var(--fx-yellow)]"
          >
            See our work
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </Reveal>
      </RevealGroup>
  
      {/* ── What we build ──────────────────────────────────────────────────────
          The slot where the reference put a row of partner logos. We have none,
          and a wall of invented ones is the exact thing this site has been
          cleared of — so it carries the five offerings, which are true and do
          the same job of saying what you are looking at.
  
          This is the obvious place for a marquee and it deliberately does not
          get one: every chip here is a link to /services, and a link that slides
          out from under the cursor is a link you have to chase. The ticker in
          the kit is for labels, not for hit areas. */}
      <RevealGroup
        className="mt-auto flex w-full max-w-4xl flex-col items-center pt-20"
        delay={0.25}
        stagger={0.06}
      >
        <Reveal>
          <p style={MONO_STYLE} className={EYEBROW_TEXT}>
            What we build
          </p>
        </Reveal>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
          {OFFERINGS.map((offering) => (
            <Reveal key={offering}>
              <a
                href="/services"
                className="block rounded-[4px] border border-[var(--fx-faint)] bg-[var(--fx-white)]/[0.06] px-4 py-2.5 text-[13px] font-medium whitespace-nowrap text-[var(--fx-white)] backdrop-blur-sm transition-colors duration-200 hover:border-[var(--fx-yellow)] hover:text-[var(--fx-yellow)] sm:text-[15px]"
              >
                {offering}
              </a>
            </Reveal>
          ))}
        </div>
      </RevealGroup>
    </section>
  );
};
