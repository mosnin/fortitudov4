"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingHero } from "@/components/layout/marketing-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { services } from "@/lib/services";
import { ArrowRight, Check, Star } from "lucide-react";
import { motion } from "motion/react";

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <MarketingHero
          eyebrow="What we build"
          title={<>Four disciplines, <span className="text-gradient-orange">one studio.</span></>}
          subtitle="From first conversation to launch, we build the digital assets and architecture your business runs on. Pick a discipline — we scope the rest into a Blueprint."
        />

        {/* Service detail sections */}
        {services.map((service, index) => {
          const isEven = index % 2 === 0;
          return (
            <section
              key={service.id}
              id={service.id}
              className={`py-20 sm:py-28 ${!isEven ? "bg-charcoal-dark/30" : ""}`}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center ${
                    !isEven ? "lg:direction-rtl" : ""
                  }`}
                >
                  {/* Text */}
                  <div className={!isEven ? "lg:order-2" : ""}>
                    <div className="mb-4">
                      <Badge variant="orange">{service.startingPrice}</Badge>
                    </div>
                    <h2 className="text-3xl font-bold sm:text-4xl">{service.name}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      {service.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {service.capabilities.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-4 w-4 shrink-0 text-orange" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="glow" size="lg" className="mt-8" asChild>
                      <Link href={`/onboarding?discipline=${service.id}`}>
                        Start a {service.name} Brief
                        <ArrowRight className="ml-1 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>

                  {/* Visual placeholder card */}
                  <div className={!isEven ? "lg:order-1" : ""}>
                    <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
                      <div className="flex items-center gap-2 mb-6">
                        <Star className="h-5 w-5 text-orange" />
                        <span className="text-sm font-medium">What&apos;s included</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          "Project discovery & requirements",
                          "Custom UI/UX design",
                          "Full development & integration",
                          "Quality assurance & testing",
                          "Deployment & launch support",
                          "30-day post-launch support",
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-3 text-sm">
                            <Check className="h-4 w-4 text-success shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })}

        {/* Bottom CTA */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Not sure which service is right?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Book a free consultation and we&apos;ll help you pick the best path forward.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button variant="glow" size="lg" asChild>
                <Link href="/contact">
                  Book a Consultation
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
