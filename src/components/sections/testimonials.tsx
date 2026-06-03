"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const testimonials = [
  {
    quote:
      "Fortitudo shipped our commerce platform in three weeks and our conversion rate tripled. The real-time tracker meant I always knew exactly where the build stood.",
    name: "Sarah Mitchell",
    role: "Founder, Maison Noir",
    rating: 5,
  },
  {
    quote:
      "Best studio experience I've had. No back-and-forth, no mystery timelines — everything lived in the dashboard. Our SaaS launched on time and on budget.",
    name: "David Chen",
    role: "CTO, DataPulse",
    rating: 5,
  },
  {
    quote:
      "The AI agent they built saves us 20+ hours a week. They actually understood our workflow and architected exactly what we needed.",
    name: "Maria Gonzalez",
    role: "Operations Lead, HelpStream",
    rating: 5,
  },
  {
    quote:
      "They re-architected our infrastructure and our deploys went from hours to minutes. Genuine builders who care about what's under the hood.",
    name: "James Okafor",
    role: "CEO, GrowthForge",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-charcoal-dark py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Clients</p>
          <h2 className="font-brand mt-3 text-3xl text-white sm:text-4xl lg:text-5xl">
            Builders they <span className="text-gradient-orange">trust</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="h-full"
            >
              <SpotlightCard className="h-full p-6 sm:p-8">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-orange text-orange" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed text-white/80">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-white/50">{testimonial.role}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
