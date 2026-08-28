"use client";

import { useState } from "react";
import { CheckCircle, Clock, Loader2, Mail, MapPin, Send } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/shader/page-hero";
import { CONTACT } from "@/lib/i18n/dictionaries/contact";
import { fill } from "@/lib/i18n/dictionaries/pricing";
import { services } from "@/lib/services";

const EMPTY = { name: "", email: "", company: "", service: "", message: "" };
const CONTACT_EMAIL = "hello@fortitudo.agency";
const t = CONTACT.en;
const FIELD = "w-full rounded-md border border-foreground/15 bg-foreground/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
const LABEL = "mb-2 block text-sm font-medium text-foreground/65";

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof EMPTY) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? fill(t.form.errorSend, { email: CONTACT_EMAIL }));
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError(fill(t.form.errorNetwork, { email: CONTACT_EMAIL }));
      setStatus("idle");
    }
  }

  const details = [
    { icon: Mail, title: t.details.emailTitle, body: CONTACT_EMAIL },
    { icon: Clock, title: t.details.responseTitle, body: t.details.responseBody },
    { icon: MapPin, title: t.details.locationTitle, body: t.details.locationBody },
  ];

  return (
    <>
      <PageHero eyebrow={t.hero.eyebrow} title={<>{t.hero.titleLead} <span className="text-[#f8cd02]">{t.hero.titleAccent}</span></>} lead={t.hero.body} />
      <section className="bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-8 lg:gap-14 max-[850px]:grid-cols-1">
          <div className="col-span-3 rounded-2xl border border-foreground/10 bg-foreground/[0.035] p-6 sm:p-9 max-[850px]:col-span-1">
            {status === "sent" ? (
              <div className="flex min-h-[480px] flex-col items-start justify-center">
                <CheckCircle className="h-11 w-11 text-accent" aria-hidden />
                <h2 className="mt-6 text-4xl font-medium tracking-tight">{t.sent.title}</h2>
                <p className="mt-3 text-foreground/60">{t.sent.body}</p>
                <button type="button" onClick={() => { setForm(EMPTY); setStatus("idle"); }} className="mt-8 rounded-md border border-foreground/15 px-5 py-3 text-xs font-medium uppercase tracking-widest hover:bg-foreground/[0.05]">{t.sent.again}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                  <div><label htmlFor="name" className={LABEL}>{t.form.nameLabel} <span className="text-accent">*</span></label><input id="name" required maxLength={255} className={FIELD} value={form.name} onChange={(event) => set("name")(event.target.value)} /></div>
                  <div><label htmlFor="email" className={LABEL}>{t.form.emailLabel} <span className="text-accent">*</span></label><input id="email" type="email" required maxLength={255} className={FIELD} value={form.email} onChange={(event) => set("email")(event.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                  <div><label htmlFor="company" className={LABEL}>{t.form.companyLabel}</label><input id="company" maxLength={255} className={FIELD} value={form.company} onChange={(event) => set("company")(event.target.value)} /></div>
                  <div><label htmlFor="service" className={LABEL}>{t.form.serviceLabel}</label><select id="service" className={FIELD} value={form.service} onChange={(event) => set("service")(event.target.value)}><option value="">{t.form.serviceUnset}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></div>
                </div>
                <div><label htmlFor="message" className={LABEL}>{t.form.messageLabel} <span className="text-accent">*</span></label><textarea id="message" required rows={7} maxLength={5000} className={FIELD} placeholder={t.form.messagePlaceholder} value={form.message} onChange={(event) => set("message")(event.target.value)} /></div>
                {error ? <p role="alert" className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</p> : null}
                <button type="submit" disabled={status === "sending"} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-[#dcb602] disabled:cursor-not-allowed disabled:opacity-60">{status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}{t.form.submit}</button>
                <p className="text-xs text-foreground/45">{t.form.privacyNote}</p>
              </form>
            )}
          </div>
          <aside className="col-span-2 max-[850px]:col-span-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/45">What happens next</p>
            <h2 className="mt-5 text-3xl font-medium leading-tight tracking-tight">A real reply from the team, not an automated sales sequence.</h2>
            <div className="mt-10 border-t border-foreground/10">{details.map((detail) => { const Icon = detail.icon; return <div key={detail.title} className="flex gap-4 border-b border-foreground/10 py-6"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.7} aria-hidden /><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/40">{detail.title}</p><p className="mt-2 text-sm text-foreground/75">{detail.body}</p></div></div>; })}</div>
            <div className="mt-8 rounded-2xl bg-accent p-7 text-accent-foreground"><h2 className="text-2xl font-medium tracking-tight">{t.start.title}</h2><p className="mt-3 text-sm leading-relaxed text-accent-foreground/65">{t.start.body}</p><Link href="/sign-up" className="mt-6 inline-flex rounded-md bg-accent-foreground px-5 py-3 text-xs font-medium uppercase tracking-widest text-accent">{t.start.cta}</Link></div>
          </aside>
        </div>
      </section>
    </>
  );
}
