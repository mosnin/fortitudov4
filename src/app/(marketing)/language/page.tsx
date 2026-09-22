import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/imageworks/page-intro";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { FinalCta } from "@/components/imageworks/final-cta";
import { Reveal } from "@/components/imageworks/reveal";

const ORIGIN = "https://www.fortitudo.agency";
const LANGUAGES = [
  { label: "Español", code: "es" },
  { label: "Français", code: "fr" },
  { label: "Deutsch", code: "de" },
  { label: "Português", code: "pt" },
  { label: "Italiano", code: "it" },
  { label: "Русский", code: "ru" },
  { label: "العربية", code: "ar" },
  { label: "日本語", code: "ja" },
] as const;

export const metadata: Metadata = {
  title: "Language and translation | Fortitudo",
  description:
    "Read Fortitudo's public website in English or open a machine translated version of the page you were viewing.",
  alternates: { canonical: `${ORIGIN}/language` },
};

function safePath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function translationUrl(path: string, language: string): string {
  const target = `${ORIGIN}${path}`;
  const params = new URLSearchParams({ sl: "en", tl: language, u: target });
  return `https://translate.google.com/translate?${params.toString()}`;
}

export default async function LanguagePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const path = safePath(from);
  return (
    <>
      <PageIntro
        label="Language"
        title="Read this page in your language."
        lead="English is Fortitudo's source copy. Choose a language below to open a machine translated view from Google Translate. Translations may contain errors and do not replace the English terms, privacy notice or project agreement."
      />
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32" aria-labelledby="language-list-title">
        <SectionHeading
          id="language-list-title"
          title="Choose a language."
          description="Google Translate opens a machine translated version of the page you were viewing in a new tab."
        />
        <Reveal inView delay={0.1}>
          <div className="mt-14 grid border-t border-border sm:mt-16 sm:grid-cols-2">
            {LANGUAGES.map((language) => (
              <a
                className="group flex items-start justify-between gap-4 border-b border-border py-6 sm:odd:pr-8 sm:even:border-l sm:even:pl-8"
                href={translationUrl(path, language.code)}
                key={language.code}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span>
                  <strong className="block font-sans text-2xl font-normal tracking-[-0.02em]" lang={language.code}>{language.label}</strong>
                  <small className="mt-2 block text-sm leading-6 text-muted-foreground">Translate {path}</small>
                </span>
                <ArrowUpRight className="mt-1 h-4 w-4 text-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </a>
            ))}
          </div>
        </Reveal>
        <p className="mt-8 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          <Link className="mr-2 font-medium text-foreground underline underline-offset-4" href={path}>Continue in English.</Link>
          Need an approved translation for a proposal or project document?{" "}
          <Link className="font-medium text-foreground underline underline-offset-4" href="/contact">Tell us which language and material is involved.</Link>
        </p>
      </section>
      <FinalCta />
    </>
  );
}
