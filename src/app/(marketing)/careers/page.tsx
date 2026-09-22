import type { Metadata } from "next";
import Link from "next/link";
import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  EditorialClose,
  EditorialHero,
  SourceAccordion,
} from "@/components/imageworks/expansion";

export const metadata: Metadata = {
  title: "Careers | Fortitudo",
  description:
    "Learn how Fortitudo works and find current opportunities across design, development and digital operations.",
  alternates: { canonical: "https://www.fortitudo.agency/careers" },
};

const principles = [
  {
    title: "Own the complete result",
    body: "Understand the business problem, the customer journey and the operating details behind the part you deliver.",
  },
  {
    title: "Make decisions visible",
    body: "Write down assumptions, constraints and tradeoffs so clients and teammates can review the work while there is time to improve it.",
  },
  {
    title: "Leave useful ownership behind",
    body: "Build for the people who will operate the result. Clear access, documentation and handover are part of the work.",
  },
];

export default function CareersPage() {
  return (
    <LibraryMotion>
      <EditorialHero
        label="Careers"
        title="Do considered work. Take responsibility for the result."
        lead="Fortitudo brings strategy, design and implementation into one delivery team. We look for people who can work across the whole problem and communicate clearly with the people affected by it."
        ctaHref="mailto:hello@fortitudo.agency?subject=Careers%20at%20Fortitudo"
        ctaLabel="Introduce yourself"
      />
      <section className="editorial-section">
        <div className="editorial-section-head">
          <p className="editorial-label">How we work</p>
          <h2>Craft, judgment and accountability belong together.</h2>
        </div>
        <div className="industry-priority-list">
          {principles.map((item, index) => (
            <article key={item.title}>
              <span className="editorial-number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="editorial-section">
        <div className="editorial-section-head">
          <p className="editorial-label">Open roles</p>
          <h2>No open roles are listed right now.</h2>
        </div>
        <SourceAccordion
          id="careers"
          items={[
            {
              question: "Can I send a general introduction?",
              answer:
                "Yes. Send a short note about the work you do, the problems you are strongest at solving and links to work you can discuss. We cannot promise a role or a reply to every introduction.",
            },
            {
              question: "Where will future roles appear?",
              answer:
                "Any active role will be published on this page with its responsibilities, working arrangement and application instructions.",
            },
            {
              question: "Does Fortitudo use recruiters?",
              answer:
                "A real opportunity will be listed here and correspondence will come from a fortitudo.agency address. We will never ask a candidate to pay for equipment, software or an application.",
            },
          ]}
        />
        <div className="editorial-actions">
          <Link
            className="button-04"
            href="mailto:hello@fortitudo.agency?subject=Careers%20at%20Fortitudo"
          >
            <span className="span-wrapper">
              <span className="span-text">Send an introduction</span>
            </span>
          </Link>
        </div>
      </section>
      <EditorialClose title="Interested in working with us as a client?">
        Tell us what you are trying to change and the people, systems and constraints involved. We will help define a sensible starting point.
      </EditorialClose>
    </LibraryMotion>
  );
}
