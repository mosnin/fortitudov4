import { HeroVideo } from "@/components/imageworks/hero-video";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { catalogService, serviceEnquiry } from "@/lib/service-catalog";
import { notFound } from "next/navigation";
import { JOURNAL, journalArticle, articleUrl, readingMinutes, articleStructuredData, EDITORIAL_ORIGIN } from "@/lib/journal";
import { JournalCards } from "@/components/imageworks/journal-cards";
export function generateStaticParams() { return JOURNAL.map(p => ({slug:p.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const p=journalArticle((await params).slug); if(!p) notFound();
  return {title:`${p.title} | Fortitudo`,description:p.description,alternates:{canonical:`${EDITORIAL_ORIGIN}${articleUrl(p)}`},openGraph:{type:"article",title:p.title,description:p.description,url:`${EDITORIAL_ORIGIN}${articleUrl(p)}`,publishedTime:p.published,modifiedTime:p.published,authors:[`${EDITORIAL_ORIGIN}/about`],images:[{url:`${EDITORIAL_ORIGIN}${p.cover}`,width:p.coverWidth,height:p.coverHeight,alt:p.coverAlt}]},twitter:{card:"summary_large_image",title:p.title,description:p.description,images:[`${EDITORIAL_ORIGIN}${p.cover}`]}};
}
export default async function Article({params}:{params:Promise<{slug:string}>}) {
  const p=journalArticle((await params).slug); if(!p) notFound();
  const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Blog",item:`${EDITORIAL_ORIGIN}/blog`},{"@type":"ListItem",position:2,name:p.title,item:`${EDITORIAL_ORIGIN}${articleUrl(p)}`}]};
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([articleStructuredData(p),breadcrumb]).replace(/</g,"\\u003c")}}/>
    <article>
      <header className="video-page-hero journal-video-hero px-4 pt-36 pb-12 sm:px-6 sm:pt-44 sm:pb-16">
        <HeroVideo />
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><Link href="/blog" className="inline-flex min-h-11 items-center underline underline-offset-4">Blog</Link><span aria-hidden>/</span><Link href={`/blog?topic=${encodeURIComponent(p.category)}`} className="inline-flex min-h-11 items-center">{p.category}</Link></nav>
        <h1 className="max-w-[1050px] text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[1.06] tracking-[-0.035em]">{p.title}</h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">{p.description}</p>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><Link href="/about" className="underline underline-offset-4">By Fortitudo</Link><time dateTime={p.published}>21 September 2026</time><span>{readingMinutes(p)} min read</span></div>
      </header>
      <figure className="mx-auto max-w-[840px] px-4 sm:px-6"><div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black"><Image src={p.cover} alt={p.coverAlt} fill sizes="(min-width:1440px) 1392px,100vw" className="object-contain" preload/></div><figcaption className="mt-3 text-xs text-muted-foreground">Conceptual artwork created for Fortitudo.</figcaption></figure>
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <aside><nav aria-label="On this page" className="border-t border-border pt-5 lg:sticky lg:top-28"><p className="mb-4 text-sm font-medium">In this guide</p><ol className="space-y-2">{p.sections.map(s=><li key={s.id}><a href={`#${s.id}`} className="inline-flex min-h-11 items-center rounded-sm text-sm leading-6 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">{s.heading}</a></li>)}<li><a href="#checklist" className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4">Your checklist</a></li></ol></nav></aside>
        <div className="min-w-0 max-w-[740px]">
          <p className="text-xl leading-9 tracking-[-0.01em]">{p.intro}</p>
          {p.sections.map(s=><section key={s.id} id={s.id} className="mt-14 scroll-mt-28"><h2 className="text-3xl leading-tight tracking-tight">{s.heading}</h2>{s.paragraphs.map(t=><p key={t} className="mt-6 text-[17px] leading-8 text-muted-foreground sm:text-lg sm:leading-9">{t}</p>)}</section>)}
          <section id="checklist" className="mt-14 scroll-mt-28 rounded-2xl border border-border bg-muted p-6 sm:p-9"><h2 className="text-2xl tracking-tight">Your checklist</h2><ol className="mt-6 space-y-5">{p.checklist.map((t,i)=><li key={t} className="flex gap-4 text-base leading-7"><span className="pt-1 text-xs tabular-nums text-muted-foreground">{String(i+1).padStart(2,"0")}</span><span>{t}</span></li>)}</ol></section>
          <section className="mt-14"><h2 className="text-3xl tracking-tight">A few common questions</h2>{p.faq.map(f=><div key={f.question} className="mt-7 border-t border-border pt-6"><h3 className="text-xl leading-7">{f.question}</h3><p className="mt-4 text-[17px] leading-8 text-muted-foreground">{f.answer}</p></div>)}</section>
          {p.sources.length>0 && <section className="mt-14 border-t border-border pt-7"><h2 className="text-lg">References and further reading</h2><ul className="mt-4 space-y-3">{p.sources.map(s=><li key={s.url}><a href={s.url} className="inline-flex min-h-11 items-center text-sm leading-6 text-muted-foreground underline underline-offset-4 hover:text-foreground">{s.title} ↗</a></li>)}</ul></section>}
          <section className="mt-14 border-y border-border py-9"><p className="text-sm text-muted-foreground">Put the thinking to work</p><h2 className="mt-3 text-3xl tracking-tight">Define your next step.</h2><p className="mt-4 text-base leading-7 text-muted-foreground">Explore the relevant service, or bring your current setup and the decision you need to make. We will help you define the scope.</p><div className="mt-6 flex flex-wrap gap-5"><Link href={`/services/${p.service}`} className="inline-flex min-h-12 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Explore {p.category.toLowerCase()} →</Link><Link href={catalogService(p.service) ? serviceEnquiry(catalogService(p.service)!) : "/contact?service=software_solutions"} className="inline-flex min-h-12 items-center text-sm underline underline-offset-4">Discuss your project</Link></div></section>
        </div>
      </div>
    </article>
    <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6"><h2 className="mb-10 text-3xl tracking-tight">Keep exploring.</h2><JournalCards articles={JOURNAL.filter(a=>a.slug!==p.slug).slice(0,3)}/></section>
  </>;
}
