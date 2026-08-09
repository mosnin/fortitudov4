import Link from "next/link";
import Image from "next/image";

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
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Client Login", href: "/sign-in" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

function LandscapeIllustration() {
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="xMidYMax slice"
      className="block h-40 w-full sm:h-52"
      aria-hidden
    >
      <defs>
        <linearGradient id="footer-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="1440" height="220" fill="url(#footer-sky)" />
      {/* Sun */}
      <circle cx="1080" cy="92" r="46" fill="#FFF7ED" opacity="0.95" />
      <circle cx="1080" cy="92" r="64" fill="#FFF7ED" opacity="0.25" />
      {/* Far hills */}
      <path
        d="M0 150c120-42 260-58 400-44 150 15 260 48 420 40 170-9 300-52 440-40 70 6 130 20 180 34v80H0v-70Z"
        fill="#C2410C"
        opacity="0.55"
      />
      {/* Mid hills */}
      <path
        d="M0 172c160-40 320-46 480-28 160 18 300 36 460 24 180-13 340-40 500-18v70H0v-48Z"
        fill="#9A3412"
        opacity="0.8"
      />
      {/* House */}
      <g transform="translate(210 120)">
        <rect x="6" y="16" width="40" height="26" fill="#1C1C1C" />
        <path d="M0 18 26 0l26 18H0Z" fill="#292524" />
        <rect x="21" y="26" width="10" height="16" fill="#F97316" />
        <rect x="10" y="21" width="7" height="7" fill="#FDBA74" />
        <rect x="35" y="21" width="7" height="7" fill="#FDBA74" />
      </g>
      {/* Trees */}
      <g fill="#1C1C1C">
        <path d="M330 146l9-22 9 22h-6v12h-6v-12h-6Z" />
        <path d="M370 152l7-17 7 17h-4.5v9h-5v-9H370Z" />
        <path d="M1230 150l10-24 10 24h-7v13h-6v-13h-7Z" />
      </g>
      {/* Foreground field */}
      <path
        d="M0 196c220-30 420-32 640-16 220 16 420 22 580 10 90-7 160-14 220-24v54H0v-24Z"
        fill="#1C1C1C"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="overflow-hidden bg-orange">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={LOGO_SRC}
                alt="Fortitudo Agency"
                width={44}
                height={44}
                className="rounded-xl"
              />
              <span className="text-3xl font-bold tracking-tight text-white">
                Fortitudo
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/85">
              A digital agency built for founders. Senior builders, fixed
              quotes, real-time tracking — accelerated by AI.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="text-sm font-bold tracking-wide text-white">
                  {column.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/80 transition-colors hover:text-white"
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

        {/* Fine print */}
        <div className="mt-14 border-t border-white/25 pt-6">
          <p className="max-w-3xl text-[11px] leading-relaxed text-white/60">
            Fortitudo Agency provides web development, ecommerce, and
            automation services. Project timelines and pricing are confirmed
            during onboarding and may vary by scope. All client work remains
            the property of the client on final delivery.
          </p>
        </div>
      </div>

      {/* Landscape illustration */}
      <LandscapeIllustration />

      {/* Bottom bar */}
      <div className="bg-charcoal-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-4 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <Image
              src={LOGO_SRC}
              alt=""
              width={20}
              height={20}
              className="rounded"
            />
            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} Fortitudo Agency. All rights
              reserved.
            </p>
          </div>
          <p className="text-xs text-white/60">foritudo.agency</p>
        </div>
      </div>
    </footer>
  );
}
