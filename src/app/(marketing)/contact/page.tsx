"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageIntro } from "@/components/imageworks/page-intro";
import { services } from "@/lib/services";
const EMPTY = { name: "", email: "", company: "", service: "", message: "" };
const FIELD =
  "mt-2 min-h-13 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const chosen = new URLSearchParams(window.location.search).get("service");
    if (services.some((s) => s.id === chosen))
      setForm((f) => ({ ...f, service: chosen! }));
  }, []);
  const update = (key: keyof typeof EMPTY, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "We could not send your brief. Please try again or email hello@fortitudo.agency.",
        );
      }
      setStatus("sent");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Please try again or email hello@fortitudo.agency.",
      );
      setStatus("idle");
    }
  }
  return (
    <>
      <PageIntro
        label="Start a conversation"
        title="What would you like to build?"
        lead="Tell us what needs to change. We will review the brief, work through the requirements, and explain the scope and price if we are a fit."
      />
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20">
          <aside>
            <h2 className="font-serif text-4xl leading-tight">
              A useful first conversation.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">
              You do not need a finished specification. Share your current
              website or product, the problem you want to solve, and any launch
              date or budget constraints.
            </p>
            <ol className="mt-8 space-y-6 text-[15px] leading-7">
              <li>We review the brief and ask about the gaps.</li>
              <li>
                We discuss the work, the dependencies and the right starting
                point.
              </li>
              <li>
                You receive a written proposal to consider before committing.
              </li>
            </ol>
            <Link
              href="mailto:hello@fortitudo.agency"
              className="mt-10 inline-flex min-h-11 items-center underline underline-offset-4"
            >
              hello@fortitudo.agency
            </Link>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Prefer to explore first?{" "}
              <Link
                href="/work"
                className="text-foreground underline underline-offset-4"
              >
                See the work
              </Link>{" "}
              or{" "}
              <Link
                href="/pricing"
                className="text-foreground underline underline-offset-4"
              >
                read how pricing works
              </Link>
              .
            </p>
          </aside>
          <div className="rounded-2xl border border-border bg-muted p-6 sm:p-10">
            {status === "sent" ? (
              <div role="status" aria-live="polite" className="py-20">
                <h2 className="font-serif text-4xl">We have your brief.</h2>
                <p className="mt-5 text-base leading-7 text-muted-foreground">
                  The team will review it and follow up using the email address
                  you provided.
                </p>
                <button
                  className="mt-8 min-h-12 rounded-xl border border-border px-5"
                  onClick={() => {
                    setForm(EMPTY);
                    setStatus("idle");
                  }}
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <fieldset
                  disabled={status === "sending"}
                  className="space-y-6 disabled:opacity-70"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-medium" htmlFor="name">
                      Your name
                      <input
                        id="name"
                        name="name"
                        autoComplete="name"
                        required
                        maxLength={255}
                        className={FIELD}
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </label>
                    <label
                      className="block text-sm font-medium"
                      htmlFor="email"
                    >
                      Email address
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={255}
                        className={FIELD}
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                      />
                    </label>
                  </div>
                  <label
                    className="block text-sm font-medium"
                    htmlFor="company"
                  >
                    Company{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                    <input
                      id="company"
                      name="company"
                      autoComplete="organization"
                      maxLength={255}
                      className={FIELD}
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                    />
                  </label>
                  <label
                    className="block text-sm font-medium"
                    htmlFor="service"
                  >
                    What are you considering?
                    <select
                      id="service"
                      name="service"
                      className={FIELD}
                      value={form.service}
                      onChange={(e) => update("service", e.target.value)}
                    >
                      <option value="">Help me work it out</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label
                    className="block text-sm font-medium"
                    htmlFor="message"
                  >
                    Your project
                    <textarea
                      id="message"
                      name="message"
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={6}
                      className={FIELD}
                      placeholder="What do you have now, what needs to change, and when would you like to launch?"
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                    />
                  </label>
                </fieldset>
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}
                <button
                  disabled={status === "sending"}
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-foreground px-5 text-[15px] font-medium text-background transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
                >
                  {status === "sending"
                    ? "Sending your brief…"
                    : "Send your project brief →"}
                </button>
                <p className="text-sm leading-6 text-muted-foreground">
                  We use these details to respond to your enquiry. Read our{" "}
                  <Link
                    className="underline underline-offset-4"
                    href="/privacy"
                  >
                    privacy policy
                  </Link>
                  . Sending a brief does not commit you to a project.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
