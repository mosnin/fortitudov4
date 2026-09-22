import type { Metadata } from "next";
import Link from "next/link";
import { LibraryMotion } from "@/components/imageworks/library-motion";
import { EditorialHero } from "@/components/imageworks/expansion";

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
    <LibraryMotion>
      <EditorialHero
        label="Language"
        title="Read this page in your language."
        lead="English is Fortitudo's source copy. Choose a language below to open a machine translated view from Google Translate. Translations may contain errors and do not replace the English terms, privacy notice or project agreement."
        ctaHref={path}
        ctaLabel="Continue in English"
      />
      <section className="editorial-section" aria-labelledby="language-list-title">
        <div className="editorial-section-head">
          <p className="editorial-label">Machine translation</p>
          <h2 id="language-list-title">Choose a language.</h2>
        </div>
        <div className="industry-work-list">
          {LANGUAGES.map((language) => (
            <a
              href={translationUrl(path, language.code)}
              key={language.code}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>
                <strong lang={language.code}>{language.label}</strong>
                <small>
                  Opens a machine translated version of {path} in a new tab.
                </small>
              </span>
              <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
        <p className="translation-note">
          Need an approved translation for a proposal or project document?{" "}
          <Link href="/contact">Tell us which language and material is involved.</Link>
        </p>
      </section>
    </LibraryMotion>
  );
}
