import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-charcoal-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
                alt="Fortitudo Agency"
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="text-lg font-bold">Fortitudo</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Digital solutions built for growth. We help businesses launch web
              apps, stores, funnels, and AI automation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-foreground transition-colors">Web Applications</a></li>
              <li><a href="#services" className="hover:text-foreground transition-colors">Ecommerce Stores</a></li>
              <li><a href="#services" className="hover:text-foreground transition-colors">Funnels</a></li>
              <li><a href="#services" className="hover:text-foreground transition-colors">AI Automation</a></li>
              <li><a href="#services" className="hover:text-foreground transition-colors">Open Claw Deployment</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><Link href="/sign-in" className="hover:text-foreground transition-colors">Client Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Fortitudo Agency. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
