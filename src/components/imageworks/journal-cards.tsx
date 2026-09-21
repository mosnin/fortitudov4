import Image from "next/image";
import Link from "next/link";
import { JOURNAL, articleUrl, readingMinutes, type JournalArticle } from "@/lib/journal";
export function JournalCards({ articles = JOURNAL }: { articles?: JournalArticle[] }) {
  return <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{articles.map(p => <article key={p.slug}>
    <Link href={articleUrl(p)} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black"><Image src={p.cover} alt={p.coverAlt} fill sizes="(min-width:1024px) 33vw,(min-width:768px) 50vw,100vw" className="object-contain transition-opacity duration-500 group-hover:opacity-90" /></div>
      <p className="mt-5 text-xs tracking-wide text-muted-foreground">{p.category} <span aria-hidden> / </span> {readingMinutes(p)} min read</p>
      <h2 className="mt-3 text-2xl leading-tight tracking-tight sm:text-[28px]">{p.title}</h2>
      <p className="mt-4 text-[15px] leading-7 text-muted-foreground">{p.description}</p>
      <span className="mt-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4">Read the guide <span aria-hidden className="ml-2">↗</span></span>
    </Link>
  </article>)}</div>;
}
export function ServiceReading({ service }: { service: string }) {
  const article = JOURNAL.find(p => p.service === service);
  if (!article) return null;
  return <section aria-label="Related guide" className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 sm:pb-32"><div className="grid items-center gap-8 border-y border-border py-9 md:grid-cols-[1fr_2fr] lg:gap-16">
    <Link href={articleUrl(article)} className="relative block aspect-[4/5] overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" aria-label={article.title}><Image src={article.cover} alt={article.coverAlt} fill sizes="(min-width:768px) 33vw,100vw" className="object-contain"/></Link>
    <div><p className="text-sm text-muted-foreground">Before you begin · From the blog</p><h2 className="mt-4 max-w-2xl text-3xl leading-tight tracking-tight sm:text-4xl"><Link href={articleUrl(article)} className="rounded-sm focus-visible:outline-2 focus-visible:outline-ring">{article.title}</Link></h2><p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">{article.description}</p><Link href={articleUrl(article)} className="mt-5 inline-flex min-h-11 items-center underline underline-offset-4">Read the guide →</Link></div>
  </div></section>;
}
