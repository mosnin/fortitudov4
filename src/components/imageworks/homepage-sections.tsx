import Image from "next/image";
import Link from "next/link";
import { ArrowButton } from "./arrow-button";
import { SectionHeading } from "./section-heading";
import { SERVICE_CATALOG, servicePdf } from "@/lib/service-catalog";
import { servicePhoto } from "@/content/service-groups";

const steps = [
  ["Define the scope", "Turn the brief into deliverables, responsibilities, milestones and an agreed project price."],
  ["Design and build", "Review the design and working product as it takes shape, with clear points for decisions and feedback."],
  ["Launch and hand over", "Check the agreed journeys, prepare the launch and transfer the files, access and guidance your team needs."],
];

export function HomeProcess() {
  return <section className="home-process home-section" aria-labelledby="home-process-heading">
    <div className="home-process-intro"><p className="home-eyebrow">How we work</p><h2 id="home-process-heading" data-reveal-06 data-resting-color="#fafafa">A clear path from brief to launch.</h2><p>You stay involved in the decisions. We bring the design and engineering together, with the scope and handover agreed from the start.</p><Link href="/approach">Our approach ↗</Link></div>
    <ol>{steps.map(([title,body],i)=><li key={title}><span className="home-step-number">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
  </section>;
}

export function HomeAgency() {
  return <section className="home-agency home-section" aria-labelledby="home-agency-heading">
    <div className="home-agency-portrait"><Image src="/about/preston-wilms.jpg" alt="Preston Wilms, founder of Fortitudo" width={200} height={200} sizes="160px" className="object-cover"/><p>Preston Wilms<span>Founder, Fortitudo</span></p></div>
    <div><p className="home-eyebrow">The agency</p><h2 id="home-agency-heading">Design with a business behind it.</h2><p>Fortitudo brings brand, design and development into one practice. We work with founders, established businesses and product teams to build websites, stores, software and applied AI.</p><p>From a focused improvement to a complete product, the work starts with what your business needs to achieve.</p><ArrowButton href="/about" className="mt-7 text-base">Meet Fortitudo</ArrowButton></div>
  </section>;
}

export function HomeDecks() {
  const entries=SERVICE_CATALOG.filter(s=>["ecommerce","software-solutions","ai-solutions"].includes(s.slug));
  return <section className="home-decks home-section" aria-labelledby="home-decks-heading"><SectionHeading id="home-decks-heading" title="Take a closer look." description="The scope, delivery and handover, ready to share with your team." aside={<Link href="/resources" className="text-sm underline underline-offset-4">All service decks ↗</Link>}/><div className="home-deck-list">{entries.map(s=><article key={s.slug}><Link href={`/resources/${s.resourceSlug}`} className="home-deck-image"><Image src={servicePhoto(s.slug)} alt="" fill sizes="(min-width:768px) 140px, 92px" className="object-cover"/></Link><div><p className="home-eyebrow">Service deck · PDF</p><h3><Link href={`/resources/${s.resourceSlug}`}>{s.name}</Link></h3></div><a href={servicePdf(s)} download aria-label={`Download ${s.name} PDF`}>Download <span aria-hidden>↓</span></a></article>)}</div></section>;
}
