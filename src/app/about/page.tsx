"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingHero } from "@/components/layout/marketing-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const values = [
  {
    title: "Transparency",
    description: "You see every step of the build process. No black boxes, no mystery timelines. Real-time visibility from day one.",
  },
  {
    title: "Speed Without Shortcuts",
    description: "We deliver fast because we have battle-tested processes — not because we cut corners. Quality is non-negotiable.",
  },
  {
    title: "Results-Driven",
    description: "Every decision we make is geared toward your business outcomes. Beautiful design means nothing without conversions.",
  },
  {
    title: "Reliability",
    description: "We stand behind our work with post-launch support and a structured revision process. We're here for the long haul.",
  },
  {
    title: "Partnership",
    description: "We're not just vendors — we're invested in your success. Direct communication, honest feedback, and genuine care.",
  },
  {
    title: "Client-First",
    description: "Your needs drive every project. We listen carefully, ask the right questions, and build exactly what you envision.",
  },
];

const timeline = [
  { year: "Founded", event: "Started with a mission to make professional digital services accessible to businesses of all sizes." },
  { year: "Growing", event: "Expanded our team and service offerings to cover web apps, ecommerce, funnels, AI, and infrastructure." },
  { year: "Today", event: "Serving clients worldwide with a transparent, phase-based approach that puts you in control." },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <MarketingHero
          eyebrow="About"
          title={<>The studio for the <span className="text-gradient-orange">AI age</span></>}
          subtitle="Fortitudo is a bespoke building studio. We design and build the software, commerce, AI, and infrastructure ambitious businesses run on — with the craft of a product team and the clarity of a studio."
        />

        {/* Mission */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Our Mission</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  We created Fortitudo because we saw too many businesses getting burned by
                  opaque agencies — missed deadlines, unclear pricing, and zero visibility
                  into what was actually happening with their project.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Our platform changes that. From the moment you select a service to the
                  day we launch, you have a real-time dashboard showing exactly where your
                  project stands. You can upload files, request revisions, and message our
                  team directly — all in one place.
                </p>
                <p className="mt-4 text-muted-foreground">
                  We believe the best client relationships are built on trust, and trust
                  starts with transparency.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="rounded-2xl border border-border bg-card p-8 max-w-sm">
                    <Image
                      src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
                      alt="Fortitudo Agency"
                      width={120}
                      height={120}
                      className="rounded-xl mx-auto"
                    />
                    <h3 className="text-xl font-bold text-center mt-6">Fortitudo Agency</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Strength through clarity. Excellence through transparency.
                    </p>
                  </div>
                  <div className="absolute -inset-4 rounded-3xl bg-orange/5 -z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 sm:py-28 bg-charcoal-dark/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="orange" className="mb-4">Our Values</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">What drives us</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => {
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h3 className="font-semibold text-lg">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className="font-semibold text-orange">{item.year}</p>
                    <p className="mt-1 text-muted-foreground">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 sm:py-32 bg-charcoal-dark/30">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Let&apos;s build something great together
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ready to start your next project? We&apos;d love to hear from you.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button variant="glow" size="lg" asChild>
                <Link href="/contact">
                  Get in Touch <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/services">View Services</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
