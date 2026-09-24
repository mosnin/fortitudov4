"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IndustryMenu, ServiceMenu } from "./service-menu";
import { Logo } from "./logo";
import { ArrowButton } from "./arrow-button";
import { siteScroll } from "./smooth-scroll";
import { textReveal06 } from "./effects/text-reveal";
import { auraBorder } from "./effects/aura-border";

type AuraElement = HTMLDivElement & { __auraBorder?: { setActive: (active: boolean) => void; destroy: () => void } };
const LINKS = [["Home", "/"], ["Our work", "/work"], ["Services", "/services"], ["Industries", "/industries"], ["Blog", "/blog"], ["About", "/about"], ["Contact", "/contact"]];
const isMarketing = (path: string) => !/^\/(admin|dashboard|partner|sign-in|sign-up|api|post-login)(\/|$)/.test(path);
const FADE = { duration: 500, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "forwards" as const };

export function MotionShell({ children, controls }: { children: ReactNode; controls?: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const auraRoot = useRef<AuraElement>(null);
  const origin = useRef<HTMLSpanElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animation = useRef<Animation | null>(null);
  const previousPath = useRef(pathname);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const close = useCallback(() => { setOpen(false); toggle.current?.focus(); }, []);

  const resetNavigation = useCallback(() => {
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
    animation.current?.cancel();
    const surface = document.getElementById("main-content");
    if (surface) { surface.style.opacity = ""; surface.style.filter = ""; surface.removeAttribute("aria-busy"); }
    auraRoot.current?.__auraBorder?.setActive(false);
    if (overlay.current) overlay.current.dataset.visible = "false";
  }, []);

  const enter = useCallback(() => {
    if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
    const surface = document.getElementById("main-content");
    animation.current?.cancel();
    if (surface) {
      surface.style.opacity = ""; surface.style.filter = ""; surface.removeAttribute("aria-busy");
      animation.current = surface.animate([{ opacity: 0, filter: "blur(7px)" }, { opacity: 1, filter: "blur(0px)" }], FADE);
      const current = animation.current;
      current.finished.then(() => { current.cancel(); ScrollTrigger.refresh(); }).catch(() => {});
      surface.focus({ preventScroll: true });
    }
    auraRoot.current?.__auraBorder?.setActive(false);
    if (overlay.current) overlay.current.dataset.visible = "false";
  }, []);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const cleanup = textReveal06(scope);
    if (previousPath.current !== pathname) { previousPath.current = pathname; enter(); }
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { cleanup(); cancelAnimationFrame(refresh); };
  }, [pathname, enter]);

  useEffect(() => {
    const el = auraRoot.current;
    if (!el) return;
    try { auraBorder(el); } catch { el.dataset.state = "unsupported"; }
    return () => { el.__auraBorder?.destroy(); };
  }, []);

  useEffect(() => {
    const scope = root.current;
    const surface = page.current;
    const nav = drawer.current;
    if (!scope || !surface || !nav) return;

    if (open) {
      scope.style.setProperty("--drawer-scroll", `${window.scrollY}px`);
      surface.inert = true;
      siteScroll.current?.stop();
      const oldOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const tween = gsap.fromTo(nav.querySelectorAll(".eyebrow, .links a, .socials a, .divider"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.045, ease: "power3.out", delay: 0.12 });

      return () => { tween.kill(); document.body.style.overflow = oldOverflow; surface.inert = false; siteScroll.current?.start(); };
    }
    const closeTimer = setTimeout(() => setActive(false), 510);
    return () => clearTimeout(closeTimer);
  }, [open]);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (!open) return;
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key !== "Tab") return;
      const items = [toggle.current, ...Array.from(drawer.current?.querySelectorAll<HTMLElement>("a[href], input, button") ?? [])].filter((el): el is HTMLElement => !!el && !el.closest("[inert]") && el.getClientRects().length > 0);
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && (index === items.length - 1 || index < 0)) { event.preventDefault(); items[0]?.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [open, close]);

  useEffect(() => {
    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || !root.current?.contains(target) || target.hasAttribute("download") || (target.target && target.target !== "_self")) return;
      const url = new URL(target.href, location.href);
      if (url.origin !== location.origin || !isMarketing(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) { setOpen(false); return; }
      event.preventDefault(); event.stopPropagation();
      resetNavigation(); setOpen(false);
      const href = url.pathname + url.search + url.hash;
      router.prefetch(href);
      const surface = document.getElementById("main-content");
      surface?.setAttribute("aria-busy", "true");
      const contact = url.pathname === "/contact";
      if (contact && overlay.current && auraRoot.current) {
        const rect = target.getBoundingClientRect();
        if (origin.current) { origin.current.style.left = `${rect.left + rect.width / 2}px`; origin.current.style.top = `${rect.top + rect.height / 2}px`; }
        overlay.current.dataset.visible = "true";
        auraRoot.current.__auraBorder?.setActive(true);
      } else if (surface) {
        animation.current = surface.animate([{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(7px)" }], FADE);
      }
      navigationTimer.current = setTimeout(() => {
        if (surface) { surface.style.opacity = "0"; surface.style.filter = "blur(7px)"; }
        router.push(href);
        if (url.pathname === location.pathname) requestAnimationFrame(enter);
      }, contact ? 2500 : 500);
      recoveryTimer.current = setTimeout(resetNavigation, 12000);
    }
    function historyChange() { resetNavigation(); setOpen(false); }
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", historyChange);
    return () => { document.removeEventListener("click", click, true); window.removeEventListener("popstate", historyChange); resetNavigation(); };
  }, [router, resetNavigation, enter]);

  return <div ref={root} data-drawer-navigation data-open={open ? "" : undefined} data-active={active ? "" : undefined}>
    <header className="premium-header" aria-label="Site"><Logo className="h-9 w-9 justify-center" iconClassName="h-[35px] w-[35px]" compact /><ArrowButton href="/contact" className="header-cta">Get a proposal</ArrowButton></header>
    <button ref={toggle} className="toggle" type="button" data-toggle aria-controls="navigation-06-menu" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => { setActive(true); setOpen(v => !v); }}>
      <span className="toggle-label" aria-hidden="true"><span className="label-wrap"><span className="label"><span>Menu</span><span>Menu</span></span></span></span>
      <span className="toggle-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></span>
    </button>
    <nav ref={drawer} className="drawer" id="navigation-06-menu" aria-label="Main navigation" aria-hidden={!open} inert={!open} data-lenis-prevent>
      <div className="drawer-content"><p className="eyebrow">Fortitudo</p><ul className="links">{LINKS.map(([label, href]) => <li key={href}>{href === "/services" ? <ServiceMenu key={`services-${pathname}`}/> : href === "/industries" ? <IndustryMenu key={`industries-${pathname}`} /> : <Link href={href} aria-current={pathname === href ? "page" : undefined}><span>{label}</span></Link>}</li>)}</ul><div className="divider" aria-hidden="true" /><div className="socials"><Link href="/approach"><span>How we work</span></Link><Link href="/handover"><span>Ownership &amp; handover</span></Link><Link href="/ongoing-support"><span>Ongoing support</span></Link><Link href="/careers"><span>Careers</span></Link><Link href={`/language?from=${encodeURIComponent(pathname)}`}><span>Language / Translate</span></Link><Link href="/sign-in"><span>Client sign in</span></Link><a href="mailto:hello@fortitudo.agency"><span>hello@fortitudo.agency</span></a></div></div>
    </nav>
    <div className="page"><div ref={page} className="page-content">{children}</div><button className="cover" type="button" tabIndex={-1} aria-label="Close navigation" onClick={close} /></div>
    {controls && <div className="persistent-controls" inert={open}>{controls}</div>}
    {["top", "bottom"].map(edge => <div key={edge} className={`progressive-blur ${edge}-blur`} aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div key={i} className={`layer blur-${i + 1}`} />)}</div>)}
    <div ref={overlay} className="contact-transition" data-visible="false" aria-hidden="true"><div ref={auraRoot} data-aura-border data-dither-src="https://www.details.so/vault-previews/aurora-glow/_astro/dither.DYfTq7JB.png" data-state="off" data-palette="spectrum"><canvas data-aura-canvas aria-hidden="true" /><span ref={origin} data-aura-origin /><span className="contact-transition-label">Let’s talk.</span></div></div>
  </div>;
}
