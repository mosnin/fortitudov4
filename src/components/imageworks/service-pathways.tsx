import Image from "next/image";
import Link from "next/link";
import { JOURNAL } from "@/lib/journal";
export const SERVICE_PATHWAYS = [
 {name:"Software",slug:"software-solutions",detail:"Customer applications, internal tools and complete digital products."},
 {name:"Ecommerce",slug:"ecommerce",detail:"Shopify stores, migrations and considered buying experiences."},
 {name:"Websites",slug:"websites",detail:"Business websites with a clear story and a useful next step."},
 {name:"AI agents",slug:"ai-solutions",detail:"Agents, connected tools and workflows with defined operating boundaries."},
 {name:"Other tech solutions",slug:"other-tech-solutions",detail:"Integrations, context systems, infrastructure and technical repairs."},
 {name:"Consultation",slug:"consultation",detail:"A diagnosis, a recommendation and a written plan for your next decision."},
];
export function ServicePathways() {
 return <section aria-labelledby="pathways-heading" className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 sm:pb-32"><h2 id="pathways-heading" className="mb-10 text-3xl tracking-tight sm:text-4xl">Find your starting point.</h2><div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{SERVICE_PATHWAYS.map(s=>{const p=JOURNAL.find(p=>p.service===s.slug)!;return <Link key={s.slug} href={`/services/${s.slug}`} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black"><Image src={p.cover} alt={p.coverAlt} fill sizes="(min-width:1024px) 33vw,(min-width:768px) 50vw,100vw" className="object-contain transition-opacity duration-500 group-hover:opacity-90"/></div><h3 className="mt-5 flex items-center justify-between text-2xl tracking-tight">{s.name}<span aria-hidden className="text-lg">↗</span></h3><p className="mt-3 max-w-sm text-[15px] leading-7 text-muted-foreground">{s.detail}</p></Link>})}</div></section>;
}
export function ServiceCover({slug}:{slug:string}) {
 const p=JOURNAL.find(p=>p.service===slug); if(!p) return null;
 return <figure className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 sm:pb-16"><div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black sm:aspect-[16/9]"><Image src={p.cover} alt={p.coverAlt} fill sizes="(min-width:1440px) 1392px,100vw" className="object-contain"/></div></figure>;
}
