"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { services, type ServiceType } from "@/lib/services";
import { getCatalogForDiscipline, formatPrice } from "@/lib/catalog";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";

const steps = [
  { id: "discipline", title: "Discipline" },
  { id: "start", title: "Starting Point" },
  { id: "brief", title: "The Brief" },
  { id: "review", title: "Review" },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

// Direction-aware step transition. `custom` is the navigation direction
// (+1 forward, -1 back) so steps slide the way the user is moving.
const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

export default function BriefPage() {
  return (
    <Suspense>
      <BriefContent />
    </Suspense>
  );
}

function BriefContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const preselected = searchParams.get("discipline") as ServiceType | null;
  const validPreselect = services.some((s) => s.id === preselected) ? preselected : null;

  const [currentStep, setCurrentStep] = useState(validPreselect ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    discipline: (validPreselect || "") as ServiceType | "",
    catalogSlug: "",
    businessName: "",
    description: "",
    targetAudience: "",
    timeline: "",
    budget: "",
    brandColors: "",
    additionalNotes: "",
  });

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const goTo = (next: number) => {
    setDirection(next > currentStep ? 1 : -1);
    setCurrentStep(next);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return form.discipline !== "";
      case 1:
        return true; // starting point is optional
      case 2:
        return form.businessName.trim() !== "" && form.description.trim() !== "";
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline: form.discipline,
          catalogSlug: form.catalogSlug || undefined,
          businessName: form.businessName,
          description: form.description,
          targetAudience: form.targetAudience || undefined,
          timeline: form.timeline || undefined,
          budget: form.budget || undefined,
          brandColors: form.brandColors || undefined,
          additionalNotes: form.additionalNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      router.push(`/blueprint/${data.blueprintId}`);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === form.discipline);
  const catalogItems = form.discipline
    ? getCatalogForDiscipline(form.discipline as ServiceType)
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal-dark">
      {/* Signature ASCII field + radial orange glow */}
      <AsciiField className="absolute inset-0 h-full w-full opacity-[0.12]" cell={14} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.16),transparent_60%)]" />

      {/* Header (wordmark preserved) */}
      <div className="relative z-10 border-b border-border/60 bg-charcoal-dark/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
              alt="Fortitudo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-brand font-bold">Fortitudo</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {user?.firstName ? `Welcome, ${user.firstName}` : "New Brief"}
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-8">
        {/* Intro */}
        <Reveal className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-orange/80">
            Fortitudo // New Brief
          </p>
          <h1 className="mt-2 font-brand text-3xl font-bold sm:text-4xl">
            Let&apos;s architect your build
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Four quick steps. We&apos;ll turn this into a bespoke Blueprint with a real price.
          </p>
        </Reveal>

        {/* Progress */}
        <Reveal delay={0.05}>
          <div className="mb-8 flex items-center justify-between">
            {steps.map((step, index) => {
              const done = index < currentStep;
              const active = index === currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ scale: active ? 1.08 : 1 }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        done
                          ? "bg-orange text-white"
                          : active
                          ? "border-2 border-orange bg-orange/15 text-orange"
                          : "border border-border/60 bg-card/60 text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-5 w-5" /> : index + 1}
                    </motion.div>
                    <span
                      className={`mt-2 hidden text-xs sm:block ${
                        active ? "text-orange" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mx-2 h-0.5 w-8 overflow-hidden rounded-full bg-border/60 sm:w-16 lg:w-24">
                      <motion.div
                        initial={false}
                        animate={{ scaleX: done ? 1 : 0 }}
                        transition={{ duration: 0.45, ease: easeOut }}
                        style={{ originX: 0 }}
                        className="h-full rounded-full bg-gradient-to-r from-orange to-amber-400"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Card */}
        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-xl sm:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: easeOut }}
              >
                {/* Step 0: Discipline */}
                {currentStep === 0 && (
                  <>
                    <div className="mb-6">
                      <h2 className="font-brand text-2xl font-bold">What are we building?</h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Choose the discipline. We&apos;re builders — pick the kind of asset.
                      </p>
                    </div>
                    <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {services.map((service) => {
                        const isSelected = form.discipline === service.id;
                        return (
                          <RevealItem key={service.id}>
                            <motion.button
                              whileHover={{ y: -2 }}
                              transition={{ duration: 0.2, ease: easeOut }}
                              onClick={() => {
                                set("discipline", service.id);
                                set("catalogSlug", "");
                              }}
                              className={`flex h-full w-full flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? "border-orange bg-orange/5 shadow-lg shadow-orange-glow/10"
                                  : "border-border/60 hover:border-orange/40"
                              }`}
                            >
                              <div>
                                <p className="font-semibold">{service.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {service.tagline}
                                </p>
                              </div>
                              {isSelected && (
                                <Badge variant="orange" className="mt-auto">
                                  Selected
                                </Badge>
                              )}
                            </motion.button>
                          </RevealItem>
                        );
                      })}
                    </RevealGroup>
                  </>
                )}

                {/* Step 1: Starting point */}
                {currentStep === 1 && (
                  <>
                    <div className="mb-6">
                      <h2 className="font-brand text-2xl font-bold">Pick a starting point</h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Start from a proven package, or go fully bespoke. Either way you get a
                        tailored Blueprint.
                      </p>
                    </div>
                    <RevealGroup className="space-y-3">
                      {catalogItems.map((item) => {
                        const isSelected = form.catalogSlug === item.slug;
                        return (
                          <RevealItem key={item.slug}>
                            <motion.button
                              whileHover={{ y: -2 }}
                              transition={{ duration: 0.2, ease: easeOut }}
                              onClick={() => set("catalogSlug", item.slug)}
                              className={`w-full rounded-2xl border p-4 text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? "border-orange bg-orange/5"
                                  : "border-border/60 hover:border-orange/40"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold">{item.name}</p>
                                <Badge variant="orange">{formatPrice(item.fromPrice)}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                            </motion.button>
                          </RevealItem>
                        );
                      })}
                      <RevealItem>
                        <motion.button
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.2, ease: easeOut }}
                          onClick={() => set("catalogSlug", "")}
                          className={`w-full rounded-2xl border p-4 text-left transition-colors cursor-pointer ${
                            form.catalogSlug === ""
                              ? "border-orange bg-orange/5"
                              : "border-border/60 hover:border-orange/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-orange" />
                            <p className="font-semibold">Fully bespoke</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Not sure yet — describe it and we&apos;ll architect it from scratch.
                          </p>
                        </motion.button>
                      </RevealItem>
                    </RevealGroup>
                  </>
                )}

                {/* Step 2: The Brief */}
                {currentStep === 2 && (
                  <>
                    <div className="mb-6">
                      <h2 className="font-brand text-2xl font-bold">Tell us what you need</h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        The more concrete you are, the sharper the Blueprint.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">
                          Business / project name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          placeholder="Acme Inc."
                          value={form.businessName}
                          onChange={(e) => set("businessName", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">
                          What are we building? <span className="text-destructive">*</span>
                        </label>
                        <Textarea
                          placeholder="Describe the asset, the key capabilities, and anything specific. e.g. 'A web app with auth, a customer dashboard, Stripe billing, and an admin console.'"
                          rows={5}
                          value={form.description}
                          onChange={(e) => set("description", e.target.value)}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Tip: mention features like billing, admin, realtime, RAG, inventory — we
                          price them into the Blueprint automatically.
                        </p>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Who is it for?</label>
                        <Input
                          placeholder="Target users / audience"
                          value={form.targetAudience}
                          onChange={(e) => set("targetAudience", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Timeline</label>
                          <Input
                            placeholder="e.g. 4-6 weeks, ASAP"
                            value={form.timeline}
                            onChange={(e) => set("timeline", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Budget range</label>
                          <Input
                            placeholder="e.g. $5,000 - $10,000"
                            value={form.budget}
                            onChange={(e) => set("budget", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Anything else?</label>
                        <Textarea
                          placeholder="Constraints, existing systems, brand notes..."
                          rows={3}
                          value={form.additionalNotes}
                          onChange={(e) => set("additionalNotes", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <>
                    <div className="mb-6">
                      <h2 className="font-brand text-2xl font-bold">Review your Brief</h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        We&apos;ll turn this into a bespoke Blueprint with a real price.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                        <p className="mb-1 text-xs text-muted-foreground">Discipline</p>
                        <div className="flex items-center gap-2">
                          {selectedService && (
                            <>
                              <selectedService.icon className="h-5 w-5 text-orange" />
                              <span className="font-semibold">{selectedService.name}</span>
                              {form.catalogSlug && (
                                <Badge variant="orange" className="ml-auto">
                                  Starting point selected
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4">
                        <p className="mb-1 text-xs text-muted-foreground">{form.businessName}</p>
                        <p className="text-sm">{form.description}</p>
                        {form.timeline && (
                          <p className="text-sm text-muted-foreground">Timeline: {form.timeline}</p>
                        )}
                        {form.budget && (
                          <p className="text-sm text-muted-foreground">Budget: {form.budget}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex flex-col gap-3">
              {submitError && (
                <p className="text-center text-sm text-destructive">{submitError}</p>
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => goTo(currentStep - 1)}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button onClick={() => goTo(currentStep + 1)} disabled={!canProceed()}>
                    Next
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="glow" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate my Blueprint
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
