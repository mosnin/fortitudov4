"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { services, type ServiceType } from "@/lib/services";
import { getCatalogForDiscipline, formatPrice } from "@/lib/catalog";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";

const steps = [
  { id: "discipline", title: "Discipline" },
  { id: "start", title: "Starting Point" },
  { id: "brief", title: "The Brief" },
  { id: "review", title: "Review" },
];

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
    <div className="min-h-screen bg-charcoal-dark">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl">
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

      {/* Progress */}
      <div className="mx-auto max-w-4xl px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    index < currentStep
                      ? "bg-orange text-white"
                      : index === currentStep
                      ? "bg-orange/20 text-orange border-2 border-orange"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span className="mt-2 text-xs text-muted-foreground hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 sm:w-16 lg:w-24 transition-all ${
                    index < currentStep ? "bg-orange" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-border">
          {/* Step 0: Discipline */}
          {currentStep === 0 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">What are we building?</CardTitle>
                <CardDescription>Choose the discipline. We&apos;re builders — pick the kind of asset.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {services.map((service) => {
                    const isSelected = form.discipline === service.id;
                    return (
                      <button
                        key={service.id}
                        onClick={() => {
                          set("discipline", service.id);
                          set("catalogSlug", "");
                        }}
                        className={`flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-orange bg-orange/5 shadow-lg shadow-orange-glow/10"
                            : "border-border hover:border-orange/30"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{service.tagline}</p>
                        </div>
                        {isSelected && <Badge variant="orange" className="mt-auto">Selected</Badge>}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 1: Starting point */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Pick a starting point</CardTitle>
                <CardDescription>
                  Start from a proven package, or go fully bespoke. Either way you get a tailored Blueprint.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {catalogItems.map((item) => {
                  const isSelected = form.catalogSlug === item.slug;
                  return (
                    <button
                      key={item.slug}
                      onClick={() => set("catalogSlug", item.slug)}
                      className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected ? "border-orange bg-orange/5" : "border-border hover:border-orange/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{item.name}</p>
                        <Badge variant="orange">{formatPrice(item.fromPrice)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                    </button>
                  );
                })}
                <button
                  onClick={() => set("catalogSlug", "")}
                  className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                    form.catalogSlug === "" ? "border-orange bg-orange/5" : "border-border hover:border-orange/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange" />
                    <p className="font-semibold">Fully bespoke</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Not sure yet — describe it and we&apos;ll architect it from scratch.
                  </p>
                </button>
              </CardContent>
            </>
          )}

          {/* Step 2: The Brief */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Tell us what you need</CardTitle>
                <CardDescription>The more concrete you are, the sharper the Blueprint.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Business / project name <span className="text-destructive">*</span>
                  </label>
                  <Input placeholder="Acme Inc." value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    What are we building? <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe the asset, the key capabilities, and anything specific. e.g. 'A web app with auth, a customer dashboard, Stripe billing, and an admin console.'"
                    rows={5}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: mention features like billing, admin, realtime, RAG, inventory — we price them into the Blueprint automatically.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Who is it for?</label>
                  <Input placeholder="Target users / audience" value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Timeline</label>
                    <Input placeholder="e.g. 4-6 weeks, ASAP" value={form.timeline} onChange={(e) => set("timeline", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Budget range</label>
                    <Input placeholder="e.g. $5,000 - $10,000" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Anything else?</label>
                  <Textarea placeholder="Constraints, existing systems, brand notes..." rows={3} value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Review your Brief</CardTitle>
                <CardDescription>We&apos;ll turn this into a bespoke Blueprint with a real price.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Discipline</p>
                  <div className="flex items-center gap-2">
                    {selectedService && (
                      <>
                        <selectedService.icon className="h-5 w-5 text-orange" />
                        <span className="font-semibold">{selectedService.name}</span>
                        {form.catalogSlug && (
                          <Badge variant="orange" className="ml-auto">Starting point selected</Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-1">{form.businessName}</p>
                  <p className="text-sm">{form.description}</p>
                  {form.timeline && <p className="text-sm text-muted-foreground">Timeline: {form.timeline}</p>}
                  {form.budget && <p className="text-sm text-muted-foreground">Budget: {form.budget}</p>}
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex flex-col gap-3 p-6 pt-0">
            {submitError && <p className="text-sm text-destructive text-center">{submitError}</p>}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)} disabled={currentStep === 0}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="glow" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate my Blueprint
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
