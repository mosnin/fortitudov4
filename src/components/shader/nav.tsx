"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;

const serviceLinks = [
  { label: "Websites", href: "/services/websites", note: "Sites and shops built to be found." },
  { label: "Ecommerce", href: "/services/ecommerce", note: "Product pages, checkout, and store operations." },
  { label: "Software Solutions", href: "/services/software-solutions", note: "Apps, portals and internal tools." },
  { label: "AI Solutions", href: "/services/ai-solutions", note: "Useful automation for repeated work." },
  { label: "Consultation", href: "/services/consultation", note: "A senior plan before you spend." },
  { label: "Digital Marketing", href: "/services/digital-marketing", note: "Pages, campaigns and follow-up." },
] as const;

const pageLinks = [
  { label: "Work", href: "/work", note: "Eight websites and products we built." },
  { label: "Pricing", href: "/pricing", note: "How our fixed-price work runs." },
  { label: "About", href: "/about", note: "The thinking behind Fortitudo." },
  { label: "FAQ", href: "/faq", note: "Straight answers before you start." },
] as const;

export function Nav({ delay = 0.2 }: { delay?: number }): ReactNode {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeMenus = () => {
    setMenuOpen(false);
    setMegaOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const desktop = window.matchMedia("(min-width: 850px)");
    const onDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.body.style.overflow = "hidden";
    document.querySelector<HTMLButtonElement>("#fortitudo-mobile-menu button")?.focus();
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", onDesktop);
      previouslyFocused?.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && !megaOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMegaOpen(false);
      }
      if (menuOpen && event.key === "Tab") {
        const controls = Array.from(document.querySelectorAll<HTMLElement>("#fortitudo-mobile-menu a[href], #fortitudo-mobile-menu button"));
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, megaOpen]);

  return (
    <motion.nav
      aria-label="Primary navigation"
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      initial={false}
      animate="visible"
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
    >
      <div className="relative mx-auto flex max-w-[1680px] items-center justify-between px-10 py-6 max-[850px]:px-6 max-[850px]:py-4">
        <motion.div
          className="pointer-events-auto"
          variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
        >
          <motion.div
            initial={false}
            animate={{
              backgroundColor: scrolled ? "#0f0f12" : "rgba(15,15,18,0)",
              color: scrolled ? "#f8cd02" : "#0f0f12",
              borderColor: "rgba(15,15,18,0)",
            }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            data-nav-brand
            className="flex h-14 items-center rounded-lg border px-3 max-[850px]:h-[54px] max-[850px]:px-2"
          >
            <Link href="/" onClick={closeMenus} className="inline-flex min-h-11 items-center gap-3 text-xl font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current max-[850px]:gap-2 max-[850px]:text-lg">
              <BrandMark className="h-8 w-8 max-[850px]:h-7 max-[850px]:w-7" />
              <span>Fortitudo</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-auto"
          variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
        >
          <motion.div data-nav-controls initial={false} animate={{ backgroundColor: scrolled ? "#0f0f12" : "rgba(15,15,18,0)", color: scrolled ? "#f8cd02" : "#0f0f12" }} transition={{ duration: 0.45, ease: easeOutExpo }} className="flex h-14 items-center gap-1 rounded-lg border border-transparent p-1.5 text-xs font-medium uppercase tracking-widest max-[850px]:h-[54px]">
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="fortitudo-mega-menu"
              onClick={() => setMegaOpen((open) => !open)}
              className="hidden items-center gap-1.5 rounded-md px-4 py-2.5 transition-colors hover:bg-[#f8cd02] hover:text-[#0f0f12] min-[850px]:inline-flex"
            >
              Explore
              <ChevronDown size={13} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            <Link href="/work" onClick={closeMenus} className="hidden rounded-md px-4 py-2.5 transition-colors hover:bg-[#f8cd02] hover:text-[#0f0f12] min-[850px]:inline-flex">Work</Link>
            <Link href="/pricing" onClick={closeMenus} className="hidden rounded-md px-4 py-2.5 transition-colors hover:bg-[#f8cd02] hover:text-[#0f0f12] min-[850px]:inline-flex">Pricing</Link>
            <Link href="/sign-in" onClick={closeMenus} className="inline-flex min-h-11 items-center rounded-md px-3 py-2.5 normal-case tracking-normal transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">Sign in</Link>
            <Link href="/contact" onClick={closeMenus} className={`hidden min-h-11 items-center rounded-md px-4 py-2.5 transition-colors min-[850px]:inline-flex ${scrolled ? "bg-[#f8cd02] text-[#0f0f12] hover:bg-white" : "bg-[#0f0f12] text-[#f8cd02] hover:bg-black"}`}>Get a proposal</Link>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="fortitudo-mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current min-[850px]:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {megaOpen ? (
            <motion.div
              id="fortitudo-mega-menu"
              className="pointer-events-auto absolute left-10 right-10 top-[84px] hidden overflow-hidden rounded-2xl border border-white/10 bg-[#151518]/[0.98] text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl min-[850px]:block"
              initial={{ opacity: 0, y: -10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.28, ease: easeOutExpo }}
            >
              <div className="grid grid-cols-[1.3fr_0.9fr]">
                <div className="p-8 lg:p-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">What we build</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {serviceLinks.map((item, index) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenus}
                        className={`group rounded-xl border p-4 transition-colors ${index === 0 ? "border-[#f8cd02]/30 bg-[#f8cd02] text-[#0f0f12]" : "border-white/8 bg-white/[0.035] hover:bg-white/[0.07]"}`}
                      >
                        <span className="flex items-center justify-between gap-3 text-sm font-medium tracking-tight">
                          {item.label}<ArrowUpRight size={15} className="opacity-55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                        <span className={`mt-2 block text-xs leading-relaxed ${index === 0 ? "text-[#0f0f12]/65" : "text-white/48"}`}>{item.note}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-l border-white/8 bg-black/15 p-8 lg:p-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Company</p>
                  <div className="mt-5 space-y-1">
                    {pageLinks.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeMenus} className="group flex items-center justify-between gap-5 rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.06]">
                        <span>
                          <span className="block text-base font-medium tracking-tight">{item.label}</span>
                          <span className="mt-1 block text-xs text-white/45">{item.note}</span>
                        </span>
                        <ArrowUpRight size={15} className="text-white/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 flex gap-5 border-t border-white/8 pt-5 text-xs text-white/55">
                    <Link href="/sign-in" onClick={closeMenus} className="hover:text-white">Client sign in</Link>
                    <Link href="/contact" onClick={closeMenus} className="hover:text-white">Contact</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="fortitudo-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fortitudo-mobile-menu-heading"
            className="pointer-events-auto fixed inset-0 z-40 overflow-y-auto bg-[#0f0f12] px-6 pb-10 pt-24 text-white min-[850px]:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOutExpo }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <p id="fortitudo-mobile-menu-heading" className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">Menu</p>
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-md border border-white/12"><X size={19} /></button>
            </div>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">What we build</p>
            <ul className="mt-3">
              {serviceLinks.map((item) => (
                <li key={item.href} className="border-b border-white/8">
                  <Link href={item.href} onClick={closeMenus} className="flex items-center justify-between py-4 text-xl font-medium tracking-tight">{item.label}<ArrowUpRight size={17} className="text-[#f8cd02]" /></Link>
                </li>
              ))}
            </ul>
            <p className="mt-9 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Pages</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[...pageLinks, { label: "Contact", href: "/contact", note: "Tell us what you need." }, { label: "Client sign in", href: "/sign-in", note: "Open your workspace." }].map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMenus} className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-base font-medium tracking-tight">{item.label}</Link>
              ))}
            </div>
            <Link href="/contact" onClick={closeMenus} className="mt-7 flex w-full items-center justify-between rounded-md bg-[#f8cd02] px-5 py-4 text-sm font-medium uppercase tracking-widest text-[#0f0f12]">Get a price <ArrowUpRight size={17} /></Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
}
