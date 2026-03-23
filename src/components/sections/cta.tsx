import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Ready to bring your{" "}
          <span className="text-gradient-orange">vision to life?</span>
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Choose your service, complete onboarding, and watch your project come together —
          with full visibility every step of the way.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button variant="glow" size="xl" asChild>
            <Link href="/services">
              View Services
              <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">Talk to Us</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No commitment required. Free consultation available.
        </p>
      </div>
    </section>
  );
}
