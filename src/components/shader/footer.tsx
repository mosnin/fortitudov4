import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowChip } from "@/components/shader/arrow-chip";

const SERVICE_LINKS = [
  { label: "Websites", href: "/services#websites" },
  { label: "Software", href: "/services#software-solutions" },
  { label: "AI solutions", href: "/services#ai-solutions" },
  { label: "Consultation", href: "/services#consultation" },
  { label: "Marketing", href: "/services#digital-marketing" },
] as const;

const PAGE_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export function Footer(): ReactNode {
  return (
    <footer className="z-0 flex flex-col bg-background text-foreground min-[851px]:sticky min-[851px]:bottom-0">
      <div className="mx-auto w-full max-w-[1680px] px-6 pt-24 lg:px-10 lg:pt-32">
        <span className="inline-flex rounded-md border border-foreground/[0.08] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-foreground/70">Get in touch</span>
        <div className="mt-6 max-w-5xl text-4xl font-medium leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl xl:text-8xl">
          <p>Tell us what you need.</p>
          <p className="text-foreground/55">We&rsquo;ll price it clearly.</p>
        </div>
        <div className="mt-12">
          <Link href="mailto:hello@fortitudo.agency" className="group inline-flex items-stretch gap-1"><span className="rounded-md bg-foreground px-5 py-3 text-xs font-medium uppercase tracking-widest text-background">hello@fortitudo.agency</span><ArrowChip className="bg-foreground text-background" /></Link>
        </div>
      </div>
      <div className="mx-auto mt-24 grid w-full max-w-[1680px] grid-cols-2 gap-10 px-6 py-16 lg:mt-32 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-20">
        <div className="col-span-2 lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3 text-xl font-medium tracking-tight"><span aria-hidden className="grid h-8 w-8 place-items-center rounded-full border-2 border-foreground/70"><span className="h-2.5 w-2.5 rounded-full bg-accent" /></span>Fortitudo</Link>
          <p className="mt-4 max-w-xs leading-relaxed text-foreground/55">Websites, software, AI, consultation, and marketing—built by senior people and handed over completely.</p>
        </div>
        <FooterColumn title="Services" links={SERVICE_LINKS} />
        <FooterColumn title="Company" links={PAGE_LINKS} />
        <FooterColumn title="Account" links={[{ label: "Client sign in", href: "/sign-in" }, { label: "Start a project", href: "/contact" }]} />
        <FooterColumn title="Legal" links={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]} />
      </div>
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-6 py-6 text-sm text-foreground/55 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <p>© {new Date().getFullYear()} Fortitudo Agency. All rights reserved.</p>
        <Link href="/contact" className="hover:text-foreground">Start a conversation →</Link>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }): ReactNode {
  return (
    <div className="col-span-1 lg:col-span-2">
      <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-foreground/55">{title}</h3>
      <ul className="space-y-3">{links.map((link) => <li key={link.href}><Link href={link.href} className="text-foreground/85 transition-colors hover:text-foreground">{link.label}</Link></li>)}</ul>
    </div>
  );
}
