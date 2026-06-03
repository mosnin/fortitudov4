import Image from "next/image";
import Link from "next/link";
import { AsciiField } from "@/components/dashboard/ascii-field";

// Premium split auth layout: an ASCII brand panel + the Clerk form.
// On mobile the brand panel collapses to a slim signature strip.
export function AuthShell({
  children,
  tagline = "Digital assets, built bespoke.",
}: {
  children: React.ReactNode;
  tagline?: string;
}) {
  return (
    <div className="grid min-h-screen bg-charcoal-dark lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <AsciiField className="absolute inset-0 h-full w-full opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(249,115,22,0.18),transparent_60%)]" />
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Image
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
            alt="Fortitudo"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="font-brand text-lg font-bold">Fortitudo</span>
        </Link>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">The building studio</p>
          <h1 className="mt-3 font-brand text-4xl font-bold leading-tight">{tagline}</h1>
          <p className="mt-4 text-sm text-muted-foreground">Software · Commerce · AI · Infrastructure</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6">
        {/* mobile signature strip */}
        <div className="absolute inset-x-0 top-0 h-24 overflow-hidden lg:hidden">
          <AsciiField className="h-full w-full opacity-40" cell={10} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-charcoal-dark" />
        </div>
        <div className="relative z-10 w-full max-w-md flex justify-center">{children}</div>
      </div>
    </div>
  );
}
