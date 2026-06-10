"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingHero } from "@/components/layout/marketing-hero";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Check, ArrowRight, Minus } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$1,200",
    description: "Perfect for landing pages, funnels, and single-purpose sites.",
    features: [
      { name: "1 project", included: true },
      { name: "Custom design", included: true },
      { name: "Responsive & mobile-first", included: true },
      { name: "Basic SEO setup", included: true },
      { name: "1 round of revisions", included: true },
      { name: "14-day delivery", included: true },
      { name: "CMS integration", included: false },
      { name: "Advanced animations", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$2,500",
    description: "For businesses that need a complete web application or store.",
    features: [
      { name: "1 project", included: true },
      { name: "Custom design", included: true },
      { name: "Responsive & mobile-first", included: true },
      { name: "Full SEO optimization", included: true },
      { name: "3 rounds of revisions", included: true },
      { name: "21-day delivery", included: true },
      { name: "CMS integration", included: true },
      { name: "Advanced animations", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For complex projects with advanced requirements and ongoing support.",
    features: [
      { name: "Unlimited projects", included: true },
      { name: "Custom design system", included: true },
      { name: "Responsive & mobile-first", included: true },
      { name: "Full SEO optimization", included: true },
      { name: "Unlimited revisions", included: true },
      { name: "Custom timeline", included: true },
      { name: "CMS integration", included: true },
      { name: "Advanced animations", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Contact Us",
    popular: false,
  },
];

const comparisonFeatures = [
  { name: "Custom Design", starter: true, professional: true, enterprise: true },
  { name: "Responsive Build", starter: true, professional: true, enterprise: true },
  { name: "SEO Optimization", starter: "Basic", professional: "Full", enterprise: "Full + Audit" },
  { name: "Revision Rounds", starter: "1", professional: "3", enterprise: "Unlimited" },
  { name: "Delivery Timeline", starter: "14 days", professional: "21 days", enterprise: "Custom" },
  { name: "CMS Integration", starter: false, professional: true, enterprise: true },
  { name: "Payment Integration", starter: false, professional: true, enterprise: true },
  { name: "API Integrations", starter: false, professional: "Up to 3", enterprise: "Unlimited" },
  { name: "Post-Launch Support", starter: "7 days", professional: "30 days", enterprise: "90 days" },
  { name: "Priority Support", starter: false, professional: false, enterprise: true },
  { name: "Dedicated Account Manager", starter: false, professional: false, enterprise: true },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-orange mx-auto" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <MarketingHero
          eyebrow="Pricing"
          title={<>Transparent pricing, <span className="text-gradient-orange">no surprises</span></>}
          subtitle="Every engagement is scoped into a bespoke Blueprint with a real price. Start from a discipline below."
        />

        {/* Plan Cards */}
        <section className="py-16 sm:py-20 -mt-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <SpotlightCard
                    className={cn(
                      "flex h-full flex-col p-7",
                      plan.popular && "ring-1 ring-orange/40"
                    )}
                  >
                    <div className="text-center">
                      {plan.popular && (
                        <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-orange">
                          Most popular
                        </p>
                      )}
                      <h3 className="font-brand text-xl text-white">{plan.name}</h3>
                      <div className="mt-4">
                        <span className="font-brand text-4xl text-white">{plan.price}</span>
                        {plan.price !== "Custom" && (
                          <span className="ml-1 text-sm text-white/50">/ project</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-white/60">{plan.description}</p>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-2.5 text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 shrink-0 text-orange" />
                          ) : (
                            <Minus className="h-4 w-4 shrink-0 text-white/30" />
                          )}
                          <span className={feature.included ? "text-white/80" : "text-white/40"}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.price === "Custom" ? "/contact" : "/sign-up"}
                      className={cn(
                        "mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                        plan.popular
                          ? "bg-orange text-white hover:bg-orange-dark"
                          : "border border-white/15 text-white hover:border-orange/50 hover:text-orange"
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-medium text-muted-foreground w-1/4">Feature</th>
                    <th className="text-center py-3 px-4 font-medium w-1/4">Starter</th>
                    <th className="text-center py-3 px-4 font-medium text-orange w-1/4">Professional</th>
                    <th className="text-center py-3 px-4 font-medium w-1/4">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, i) => (
                    <tr key={feature.name} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="py-3 pr-4 font-medium">{feature.name}</td>
                      <td className="py-3 px-4 text-center"><FeatureCell value={feature.starter} /></td>
                      <td className="py-3 px-4 text-center"><FeatureCell value={feature.professional} /></td>
                      <td className="py-3 px-4 text-center"><FeatureCell value={feature.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="py-16 sm:py-20 bg-charcoal-dark/30">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold">Have questions about pricing?</h2>
            <p className="mt-3 text-muted-foreground">
              Check our FAQ or reach out — we&apos;re happy to help you find the right plan.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="outline" asChild>
                <Link href="/faq">View FAQ</Link>
              </Button>
              <Button variant="glow" asChild>
                <Link href="/contact">Talk to Us <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
