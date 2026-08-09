import Link from "next/link";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/landing/image-placeholder";

const LOGO_SRC =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png";

const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "Web Applications", href: "/services#web-application" },
      { label: "Ecommerce Stores", href: "/services#ecommerce-store" },
      { label: "Funnels", href: "/services#funnels" },
      { label: "AI Automation", href: "/services#ai-automation" },
      { label: "Open Claw Deployment", href: "/services#open-claw-deployment" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Client Login", href: "/sign-in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-orange">
      <div className="mx-auto max-w-[1600px] px-6 pt-14 pb-10 md:px-12 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={LOGO_SRC}
                alt="Fortitudo Agency"
                width={40}
                height={40}
                className="rounded-[10px]"
              />
              <span className="text-[28px] font-bold tracking-[-0.02em] text-white">
                Fortitudo
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-[1.5] tracking-[-0.015em] text-white/85">
              A digital agency built for founders. Senior craft, fixed quotes,
              real-time tracking — accelerated by AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="font-mono text-[12px] font-medium tracking-[0.08em] text-white/70 uppercase">
                  {column.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[14px] tracking-[-0.015em] text-white transition-opacity hover:opacity-70"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/25 pt-5">
          <p className="max-w-3xl text-[11px] leading-[1.5] text-white/60">
            Fortitudo Agency provides web development, ecommerce, and
            automation services. Project timelines and pricing are confirmed
            during onboarding and may vary by scope. All client work remains
            the property of the client on final delivery.
          </p>
        </div>
      </div>

      {/* Illustrated landscape band — final artwork slot */}
      <ImagePlaceholder
        label="Footer landscape illustration — fields, house, sunset (full-width artwork)"
        className="h-40 w-full rounded-none border-x-0 border-b-0 border-white/40 bg-orange-dark/40 text-white/70 sm:h-52"
        dark
      />

      <div className="bg-charcoal-dark">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-6 py-4 sm:flex-row md:px-12 lg:px-16">
          <div className="flex items-center gap-2">
            <Image
              src={LOGO_SRC}
              alt=""
              width={18}
              height={18}
              className="rounded-[4px]"
            />
            <p className="text-[12px] text-white/60">
              &copy; {new Date().getFullYear()} Fortitudo Agency. All rights
              reserved.
            </p>
          </div>
          <p className="text-[12px] text-white/60">foritudo.agency</p>
        </div>
      </div>
    </footer>
  );
}
