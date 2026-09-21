import { HeroVideo } from "./hero-video";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowButton } from "./arrow-button";
import { SOLUTIONS } from "@/content/solution-pathways";
import { INDUSTRIES } from "@/content/industries";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { workProject } from "@/lib/work-projects";
export function EditorialHero({
  label,
  title,
  lead,
  effect = "01",
  ctaHref = "/contact",
  ctaLabel = "Discuss your project",
}: {
  label: string;
  title: string;
  lead: string;
  effect?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const hook = { [`data-reveal-${effect}`]: "lines" };
  return (
    <header className="editorial-hero video-page-hero">
      <HeroVideo />
      <p className="editorial-label">Fortitudo / {label}</p>
      <h1 {...hook}>{title}</h1>
      <div className="editorial-hero-bottom">
        <p>{lead}</p>
        <ArrowButton href={ctaHref}>{ctaLabel}</ArrowButton>
      </div>
    </header>
  );
}
export function IndustryIndex() {
  return (
    <section className="editorial-section" aria-label="Industries">
      <div className="editorial-section-head">
        <p className="editorial-label">Operating context</p>
        <h2 data-reveal-02="lines" data-scroll data-once>
          Start with the environment your team operates in.
        </h2>
      </div>
      <div className="pathway-list">
        {INDUSTRIES.map((item, index) => (
          <Link
            key={item.slug}
            href={`/industries/${item.slug}`}
            className="pathway-row"
          >
            <span className="editorial-number">0{index + 1}</span>
            <div>
              <h3>{item.label}</h3>
              <p>{item.fit}</p>
            </div>
            <span aria-hidden>↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function IndustryPriorities({
  items,
}: {
  items: Array<{ title: string; body: string }>;
}) {
  return (
    <section className="editorial-section">
      <div className="editorial-section-head">
        <p className="editorial-label">What shapes the work</p>
        <h2>Business context before implementation.</h2>
      </div>
      <div className="industry-priority-list">
        {items.map((item, index) => (
          <article key={item.title}>
            <span className="editorial-number">0{index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function RelatedWork({ slugs }: { slugs: string[] }) {
  const projects = slugs.map(workProject).filter((item) => item !== undefined);
  if (!projects.length) return null;
  return (
    <section className="editorial-section">
      <div className="editorial-section-head">
        <p className="editorial-label">Relevant work</p>
        <h2>See the systems and experiences behind the scope.</h2>
      </div>
      <div className="industry-work-list">
        {projects.map((project) => (
          <Link href={`/work/${project.slug}`} key={project.slug}>
            <span>
              <strong>{project.name}</strong>
              <small>{project.blurb}</small>
            </span>
            <span aria-hidden>↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function PathwayIndex() {
  return (
    <section
      className="editorial-section"
      aria-label="Choose your starting point"
    >
      <div className="editorial-section-head">
        <p className="editorial-label">Your next move</p>
        <h2 data-reveal-02="lines" data-scroll data-once>
          What needs to change?
        </h2>
      </div>
      <div className="pathway-list">
        {SOLUTIONS.map((s, i) => (
          <Link
            key={s.slug}
            href={`/solutions/${s.slug}`}
            className="pathway-row"
          >
            <span className="editorial-number">0{i + 1}</span>
            <div>
              <h3>{s.label}</h3>
              <p>{s.fit}</p>
            </div>
            <span aria-hidden>↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function DeliveryStack({
  steps,
  variant = 2,
}: {
  steps: Array<{ title: string; body: string; items: string[] }>;
  variant?: 2 | 3;
}) {
  const cards = steps.map((step, i) => (
    <article className="card" data-card key={step.title}>
      <div className="card-content">
        <div>
          <span className="editorial-label">0{i + 1} / The work</span>
          <h2 data-card-title>{step.title}</h2>
        </div>
        <div className="footer" data-card-content>
          <p>{step.body}</p>
        </div>
      </div>
      <div className="delivery-inclusions">
        <p className="editorial-label">What this includes</p>
        <ul>
          {step.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  ));
  return variant === 2 ? (
    <section
      className="stacked-scroll-panel-2 delivery-stack"
      data-stacked-scroll-panel-2
      data-theme="dark"
      aria-label="Delivery stages"
    >
      <div className="stack" data-card-stack>
        {cards}
      </div>
    </section>
  ) : (
    <section
      className="delivery-stack"
      data-stacked-scroll-panel-3
      data-theme="dark"
      aria-label="Delivery stages"
    >
      <div className="runway" data-card-runway>
        <div className="stack" data-card-stack>
          {cards}
        </div>
      </div>
    </section>
  );
}
export function ScopeNotes({
  inputs,
  boundary,
}: {
  inputs: string;
  boundary: string;
}) {
  return (
    <section className="editorial-section scope-notes">
      <div>
        <p className="editorial-label">Before we begin</p>
        <h2 data-reveal-04 data-scroll data-once>
          Bring what you have.
        </h2>
        <p>{inputs}</p>
      </div>
      <div>
        <p className="editorial-label">A clear agreement</p>
        <h2>Know the boundaries.</h2>
        <p>{boundary}</p>
      </div>
    </section>
  );
}
export function RelatedServices({ slugs }: { slugs: string[] }) {
  return (
    <section className="editorial-section">
      <div className="editorial-section-head">
        <p className="editorial-label">Go deeper</p>
        <h2>Explore the scope.</h2>
      </div>
      <div className="related-service-list">
        {slugs.map((slug) => {
          const s = SERVICE_CATALOG.find((s) => s.slug === slug);
          return s ? (
            <Link href={`/services/${slug}`} key={slug}>
              <span>{s.name}</span>
              <span aria-hidden>↗</span>
            </Link>
          ) : null;
        })}
      </div>
    </section>
  );
}
export function EditorialClose({
  title = "Let's define the next step.",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <section className="editorial-close">
      <p className="editorial-label">Build with Fortitudo</p>
      <h2 data-reveal-03 data-scroll data-once>
        {title}
      </h2>
      <p>
        {children ??
          "Tell us what you are trying to achieve. We will work through the scope, dependencies and a sensible starting point."}
      </p>
      <div className="editorial-actions">
        <ArrowButton href="/contact">Discuss your project</ArrowButton>
        <Link href="/work" className="button-01">
          <span className="span-wrapper">
            <span className="span-text">Explore our work</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
export function SourceAccordion({
  items,
  id,
}: {
  items: Array<{ question: string; answer: string }>;
  id: string;
}) {
  return (
    <section
      className="accordion editorial-accordion"
      aria-label="Practical details"
    >
      {items.map((item, i) => (
        <article className="item" key={item.question}>
          <input className="toggle" type="checkbox" id={`${id}-${i}`} />
          <label className="question" htmlFor={`${id}-${i}`}>
            <span>{item.question}</span>
            <span className="icon" aria-hidden>
              <span className="icon-mark" />
            </span>
          </label>
          <div className="answer">
            <div className="answer-inner">
              <p>{item.answer}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
