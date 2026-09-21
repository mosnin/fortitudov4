import Link from "next/link";
import { LibraryMotion } from "./library-motion";
import { DeliveryStack } from "./expansion";
import { ArrowButton } from "./arrow-button";
import { SERVICE_CATALOG, servicePdf } from "@/lib/service-catalog";

export const SERVICE_GROUPS = [
  { id: "web-commerce", title: "Websites & ecommerce", description: "A considered digital presence. A better path from first visit to enquiry or purchase.", slugs: ["websites", "ecommerce"] },
  { id: "software", title: "Software & integrations", description: "Custom products and connected systems, designed around the people who use them.", slugs: ["software-solutions", "mcp-and-api"] },
  { id: "ai", title: "AI & automation", description: "Useful AI in real workflows. From the first implementation to the infrastructure behind it.", slugs: ["ai-solutions", "agent-teams", "agent-infrastructure", "jev-implementation", "context-and-memory", "creative-ai-workflows", "ai-setup-and-consulting"] },
  { id: "design-advisory", title: "Design & advisory", description: "A clear identity, a stronger existing product, and experienced guidance on what to do next.", slugs: ["brand", "unslop", "consultation"] },
];
export function AgencyServices({ detailed = false }: { detailed?: boolean }) {
 return <section className="agency-services agency-container" aria-labelledby="agency-services-title">
  <div className="agency-section-heading"><p className="agency-eyebrow">Our services</p><h2 id="agency-services-title"><span data-reveal-06>Design. Development.<br/>A complete delivery team.</span></h2><p>We bring strategy, design and engineering together to build websites, digital products and the systems behind your business.</p></div>
  <div className="agency-service-groups">{SERVICE_GROUPS.map((group, i) => <article id={group.id} key={group.id} className="agency-service-group">
    <span className="agency-eyebrow">0{i+1}</span><div><h3>{group.title}</h3><p>{group.description}</p></div>
    <ul>{(detailed ? group.slugs : group.slugs.slice(0, 3)).map(slug => { const s = SERVICE_CATALOG.find(s => s.slug === slug)!; return <li key={slug}><Link href={`/services/${slug}`}>{s.name}<span aria-hidden>↗</span></Link>{detailed && <><p>{s.lead}</p><a className="agency-download" href={servicePdf(s)} download>Download service deck ↓</a></>}</li>; })}{!detailed && group.slugs.length > 3 && <li><Link href={`/services#${group.id}`}>All AI services<span aria-hidden>↗</span></Link></li>}</ul>
  </article>)}</div>
  {!detailed && <div className="agency-section-end"><ArrowButton href="/services">Explore our services</ArrowButton><Link href="/resources">Download our pitch decks ↗</Link></div>}
 </section>;
}
export function AgencyIntroduction() { return <section className="agency-introduction agency-container"><p className="agency-eyebrow">Fortitudo / Design & development</p><h2><span data-reveal-06>From the first decision<br/>to the finished product.</span></h2><div><p>We partner with businesses to design and build their websites, commerce experiences, software and AI systems.</p><p>One team carries the work from the brief through design, development and launch—with a defined scope, review milestones and a handover your team can use.</p><Link href="/about">Meet Fortitudo ↗</Link></div></section>; }
export function AgencyDelivery() { return <LibraryMotion><section className="agency-container agency-delivery-heading"><div className="agency-section-heading"><p className="agency-eyebrow">Working with Fortitudo</p><h2 data-reveal-01="lines">Clarity at every stage.</h2></div></section><DeliveryStack variant={2} steps={[
 {title:"Define the right project.",body:"We establish the business problem, the people involved and what success needs to look like. You receive a written scope before the build.",items:["Business goals and requirements","Scope, responsibilities and project price","Design direction and review milestones"]},
 {title:"Design and build together.",body:"Review the work as it develops. Design and engineering stay connected, with decisions made against the agreed requirements.",items:["Design and working implementation","Connected systems and customer journeys","Milestone reviews and testing"]},
 {title:"Launch with ownership.",body:"Test the agreed journeys, launch the work and transfer the files, access and documentation. Any ongoing support is scoped separately.",items:["Launch and acceptance checks","Source files and account access","Documentation and operating handover"]}
 ]}/><div className="agency-container agency-delivery-links"><div className="agency-section-end"><ArrowButton href="/approach">How we work</ArrowButton><Link href="/handover">Ownership & handover ↗</Link></div></div></LibraryMotion>; }
