import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/imageworks/page-intro";
import { JournalCards } from "@/components/imageworks/journal-cards";
import { JOURNAL } from "@/lib/journal";
export const metadata: Metadata = {
  title: "Blog — Practical Guides for Building a Digital Business | Fortitudo",
  description: "Practical guides to website redesign, Shopify migration, custom software, AI agents, integrations and technical decisions for growing businesses.",
  alternates: { canonical: "https://www.fortitudo.agency/blog" },
  openGraph: { title: "The Fortitudo Blog", description: "Practical thinking for the next thing you build.", url: "https://www.fortitudo.agency/blog", images: [{ url: "https://www.fortitudo.agency/journal/software-v2.webp", width:1120, height:1400 }] },
};
export default async function Blog({ searchParams }: { searchParams: Promise<{topic?:string}> }) {
  const { topic } = await searchParams;
  const categories = [...new Set(JOURNAL.map(p => p.category))];
  const selected = categories.includes(topic ?? "") ? topic : undefined;
  const articles = selected ? JOURNAL.filter(p => p.category === selected) : JOURNAL;
  return <>
    <PageIntro label="The Fortitudo blog" title="Good questions. Considered answers." lead="Practical thinking for the next thing you build. Guides to the decisions behind websites, commerce, software and applied AI."/>
    <section aria-label="Articles" className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 sm:pb-32">
      <nav aria-label="Filter articles by topic" className="mb-12 flex flex-wrap gap-x-6 gap-y-1 border-y border-border py-3 text-sm">
        {["All articles", ...categories].map(c => { const active = c === (selected ?? "All articles"); return <Link key={c} href={c === "All articles" ? "/blog" : `/blog?topic=${encodeURIComponent(c)}`} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${active ? "text-foreground underline underline-offset-8" : "text-muted-foreground hover:text-foreground"}`}>{c}</Link>; })}
      </nav>
      <p className="mb-8 text-sm text-muted-foreground">{articles.length} {articles.length === 1 ? "guide" : "guides"}{selected ? ` · ${selected}` : " for your next decision"}</p>
      <JournalCards articles={articles}/>
    </section>
    <section className="border-t border-border px-4 py-20 text-center sm:px-6"><h2 className="text-3xl tracking-tight sm:text-4xl">Have a question about your own project?</h2><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">Bring the context. We can help you work through the options and turn the next step into a clear scope.</p><Link href="/contact?service=consultation" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-foreground px-6 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Talk through your project →</Link></section>
  </>;
}
