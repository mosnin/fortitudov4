import Link from "next/link";
import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  EditorialHero,
  DeliveryStack,
  EditorialClose,
  SourceAccordion,
} from "@/components/imageworks/expansion";
export const metadata = {
  title: "Our approach | Fortitudo",
  description:
    "How we define, design, build, review and hand over your project.",
};
const stages = [
  {
    title: "Agree what matters.",
    body: "Start with the business problem and the people who will use the result. Turn that into a scope both teams can understand.",
    items: [
      "Requirements and dependencies",
      "Deliverables and exclusions",
      "Review milestones and project price",
    ],
  },
  {
    title: "Build it together.",
    body: "Design and development stay connected. Review the work at agreed milestones so decisions happen while there is still room to act on them.",
    items: [
      "Design direction and implementation",
      "Working journeys and integrations",
      "Feedback and scope decisions",
    ],
  },
  {
    title: "Review. Launch. Hand over.",
    body: "Check the agreed result, prepare the deployment and make ownership practical with the files, access and guidance your team needs.",
    items: [
      "Acceptance and launch checks",
      "Repository and account handover",
      "Optional ongoing scope",
    ],
  },
];
export default function Page() {
  return (
    <LibraryMotion>
      <EditorialHero
        label="Our approach"
        title="Clear decisions. Considered work."
        lead="One team takes the brief through design, development and handover. You know what is being built, where your input is needed and what happens next."
      />
      <DeliveryStack steps={stages} variant={3} />
      <section className="editorial-section">
        <div className="editorial-section-head">
          <p className="editorial-label">Working together</p>
          <h2 data-reveal-04 data-scroll data-once>
            No guessing at the process.
          </h2>
        </div>
        <SourceAccordion
          id="approach"
          items={[
            {
              question: "How do we begin?",
              answer:
                "Share the problem, your current site or product, and any constraints. We clarify the requirements before proposing a scope and price.",
            },
            {
              question: "What if the scope changes?",
              answer:
                "We identify the effect on deliverables, timing and price, then agree the change before doing the additional work.",
            },
            {
              question: "Who reviews the work?",
              answer:
                "Your designated decision-maker reviews the agreed milestones. We make questions and dependencies explicit so feedback can move the project forward.",
            },
            {
              question: "What happens after launch?",
              answer:
                "The handover defines ownership and operating responsibilities. Maintenance, improvements and support can be scoped separately.",
            },
          ]}
        />
        <div className="editorial-actions">
          <Link className="button-04" href="/handover">
            <span className="span-wrapper">
              <span className="span-text">Explore the handover</span>
            </span>
          </Link>
        </div>
      </section>
      <EditorialClose />
    </LibraryMotion>
  );
}
