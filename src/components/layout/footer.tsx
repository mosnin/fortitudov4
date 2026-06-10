import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  build: [
    { label: "Software", href: "/services#software" },
    { label: "Commerce", href: "/services#commerce" },
    { label: "AI", href: "/services#ai" },
    { label: "Infrastructure", href: "/services#infrastructure" },
  ],
  studio: [
    { label: "How It Works", href: "/process" },
    { label: "About Us", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Client Login", href: "/sign-in" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-charcoal-dark px-4 pb-6 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
        <div className="px-6 py-12 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
                  alt="Fortitudo Agency"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <span className="font-brand text-lg font-bold text-white">Fortitudo</span>
              </Link>
              <p className="max-w-xs text-sm text-white/50">
                A bespoke digital studio for the AI age. We design and build the software your
                business runs on — scoped, tracked, and shipped.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-orange/80">Build</h4>
              <ul className="space-y-2.5">
                {footerLinks.build.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-orange/80">Studio</h4>
              <ul className="space-y-2.5">
                {footerLinks.studio.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-orange/80">Legal</h4>
              <ul className="space-y-2.5">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-white/10 px-6 py-4 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Fortitudo Agency. All rights reserved.
          </p>
          <p className="text-xs text-white/40">fortitudo.agency</p>
        </div>
      </div>
    </footer>
  );
}
