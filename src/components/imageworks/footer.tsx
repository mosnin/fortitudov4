"use client";
import Link from "next/link";
import Image from "next/image";

import { LogoMark } from "@/components/imageworks/logo";
import { softEase, useReducedMotion } from "@/components/imageworks/lib/motion";
import { siteConfig } from "@/components/imageworks/lib/metadata";
import { SPECTRUM_CLASS } from "@/components/imageworks/lib/spectrum";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

const COLUMNS = [
  {
    title: "Services",
    links: [
      { label: "Websites", href: "/services/websites" },
      { label: "Ecommerce", href: "/services/ecommerce" },
      { label: "Software", href: "/services/software-solutions" },
      { label: "AI solutions", href: "/services/ai-solutions" },
      { label: "Brand", href: "/services/brand" },
      { label: "Unslop", href: "/services/unslop" },
      { label: "Consultation", href: "/services/consultation" },
      { label: "Other tech solutions", href: "/services/other-tech-solutions" },
      { label: "Jev implementation", href: "/services/jev-implementation" },
      { label: "MCP & APIs", href: "/services/mcp-and-api" },
      { label: "AI engineering", href: "/services#ai-capabilities" },
    ],
  },
  {
    title: "Agency",
    links: [
      { label: "Our work", href: "/work" },
      { label: "Resources", href: "/resources" },
      { label: "Blog", href: "/blog" },
      { label: "Services", href: "/services" },
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Start a project", href: "/contact" },
      { label: "Client sign in", href: "/sign-in" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
];
const LEGAL = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];
function Newsletter(): ReactNode {
  return (
    <div className="max-w-[26rem]">
      <h2 className="font-sans text-[2rem] leading-none tracking-[-0.01em]">
        Have a project in mind?
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
        Websites, ecommerce, software and AI. Tell us where you want to take the
        business.
      </p>
      <Link
        className="mt-6 inline-flex min-h-12 items-center gap-3 text-[17px] underline underline-offset-4"
        href="mailto:hello@fortitudo.agency"
      >
        hello@fortitudo.agency <ArrowRight className="size-4" aria-hidden />
      </Link>
      <div className="relative mt-8 aspect-square w-48 sm:w-56">
        <Image src="/brand/fortitudo-glass.webp" alt="Fortitudo’s circular wave mark rendered in smoked glass." fill sizes="224px" className="object-contain" />
      </div>
    </div>
  );
}

const PROBE_PX = 100;

const FILL = 0.98;

const GLOW_R = 0.9;

function GiantBrand({ className }: { className?: string }): ReactNode {
  const colRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);
  const rawOn = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 300, damping: 30, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 300, damping: 30, mass: 0.5 });
  const on = useSpring(rawOn, { stiffness: 120, damping: 22 });
  const radius = useMotionValue(120);
  const mask = useMotionTemplate`radial-gradient(${radius}px at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 28%, rgba(0,0,0,0.55) 58%, transparent 100%)`;

  useEffect(() => {
    const col = colRef.current;
    const row = rowRef.current;
    if (!col || !row) return;

    const measure = (): number => {
      const prevCol = col.style.fontSize;
      col.style.fontSize = `${PROBE_PX}px`;
      const ratio = row.getBoundingClientRect().width / PROBE_PX;
      col.style.fontSize = prevCol;
      return ratio;
    };
    let ratio = 0;
    const fit = (): void => {
      if (!ratio) ratio = measure();
      if (!ratio) return;
      const size = (col.clientWidth * FILL) / ratio;

      col.style.fontSize = `${size}px`;
      col.style.height = `${size * 0.72}px`;
      radius.set(size * 0.72 * GLOW_R);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(col);

    document.fonts?.ready.then(() => {
      ratio = 0;
      fit();
    });
    return () => ro.disconnect();
  }, [radius]);

  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - r.left);
    rawY.set(e.clientY - r.top);
    rawOn.set(1);
  };
  const onEnter = (e: PointerEvent<HTMLDivElement>): void => {
    if (reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();

    x.jump(e.clientX - r.left);
    y.jump(e.clientY - r.top);
  };

  const rowClass =
    "absolute bottom-[-0.32em] left-1/2 flex -translate-x-1/2 items-end gap-[0.12em] leading-none font-medium tracking-[-0.05em] whitespace-nowrap select-none";
  const glyphs = (
    <>
      <LogoMark className="h-[0.86em] w-[0.86em] shrink-0 translate-y-[-0.13em]" />
      <span>Fortitudo</span>
    </>
  );

  return (
    <div
      ref={colRef}
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={() => rawOn.set(0)}
      className="relative h-[15vw] overflow-hidden"
    >
      <div ref={rowRef} className={`${rowClass} ${className ?? ""}`}>
        {glyphs}
      </div>
      {!reducedMotion && (
        <motion.div
          style={{
            opacity: on,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
          className="absolute inset-0"
        >
          <div
            className={`${SPECTRUM_CLASS} ${rowClass} [background-size:200%_100%] bg-clip-text text-transparent motion-safe:animate-[spectrum-drift_14s_linear_infinite]`}
          >
            <span
              className={`inline-block h-[0.86em] w-[0.86em] shrink-0 translate-y-[-0.13em] [mask-image:url(/brand/fortitudo-mark.png)] [background-size:200%_100%] [mask-size:100%_100%] motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
            />
            <span>Fortitudo</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function Footer(): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const rise = useTransform(scrollYProgress, [0, 1], ["52%", "0%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [0.3, 1]);

  return (
    <footer
      ref={ref}
      aria-labelledby="footer-heading"
      className="relative overflow-hidden bg-background text-foreground"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <motion.div style={reducedMotion ? {} : { y: rise, opacity: fade }}>
          <GiantBrand className="text-foreground/[0.08] dark:text-foreground/[0.14]" />
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: softEase }}
          className="relative -mt-px mb-4 rounded-2xl border border-border bg-muted px-6 pt-10 pb-6 sm:mb-6 sm:px-10 sm:pt-12 lg:px-12"
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
            <Newsletter />

            <nav aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
                {COLUMNS.map((col) => (
                  <div key={col.title}>
                    <h3 className="text-xs font-medium tracking-[0.08em] text-foreground/85 uppercase">
                      {col.title}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            className="group inline-flex items-center gap-1 rounded-sm text-[15px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            {...(l.href.startsWith("http")
                              ? { rel: "noreferrer noopener" }
                              : {})}
                          >
                            <span className="relative">
                              {l.label}
                              <span
                                aria-hidden="true"
                                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100"
                              />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 pb-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:pb-0">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span>
                &copy; {new Date().getFullYear()} {siteConfig.name}
              </span>
            </div>
            <ul className="flex flex-wrap items-center gap-5">
              {LEGAL.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
