import articles from "@/content/journal.json";
export const JOURNAL = articles;
export type JournalArticle = (typeof JOURNAL)[number];
export const journalArticle = (slug: string) => JOURNAL.find(p => p.slug === slug);
export const readingMinutes = (p: JournalArticle) => Math.max(1, Math.ceil([p.intro, ...p.sections.flatMap(s => s.paragraphs), ...p.checklist, ...p.faq.flatMap(f => [f.question, f.answer])].join(" ").split(/\s+/).length / 200));
export const articleUrl = (p: JournalArticle) => `/blog/${p.slug}`;
export const EDITORIAL_ORIGIN = "https://www.fortitudo.agency";
export function articleStructuredData(p: JournalArticle) {
  return {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: p.title, description: p.description,
    image: [`${EDITORIAL_ORIGIN}${p.cover}`],
    datePublished: p.published,
    dateModified: p.published,
    author: { "@type": "Organization", name: "Fortitudo", url: `${EDITORIAL_ORIGIN}/about` },
    publisher: { "@type": "Organization", name: "Fortitudo", url: EDITORIAL_ORIGIN },
    mainEntityOfPage: `${EDITORIAL_ORIGIN}${articleUrl(p)}`,
    inLanguage: "en", articleSection: p.category,
  };
}
