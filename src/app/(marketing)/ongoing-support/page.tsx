import Link from "next/link";
import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  EditorialHero,
  DeliveryStack,
  ScopeNotes,
  EditorialClose,
} from "@/components/imageworks/expansion";
export const metadata = {
  title: "Ongoing support | Fortitudo",
  description:
    "A defined scope for maintaining and improving your website, software or AI workflow after launch.",
};
const steps = [
  {
    title: "Keep it running.",
    body: "Agree which parts of the live system need maintenance and what each team is responsible for.",
    items: [
      "Maintenance scope and access",
      "Monitoring where agreed",
      "Issue reporting and response terms",
    ],
  },
  {
    title: "Improve what matters.",
    body: "Prioritize the next changes around business needs and the experience of the people using the product.",
    items: [
      "A reviewed improvement backlog",
      "Scoped design and development",
      "Agreed release and review cadence",
    ],
  },
  {
    title: "Keep the agreement clear.",
    body: "Use a defined monthly scope, with changes and third-party costs visible before work proceeds.",
    items: [
      "Included work and exclusions",
      "Support responsibilities",
      "Review points and next priorities",
    ],
  },
];
export default function Page() {
  return (
    <LibraryMotion>
      <EditorialHero
        label="After launch"
        title="Keep improving what you have built."
        lead="Launch creates a working foundation. Ongoing support gives maintenance and improvements a defined scope, with priorities you can review."
      />
      <DeliveryStack steps={steps} />
      <ScopeNotes
        inputs="Your current product, access requirements, known issues and the improvements that matter most."
        boundary="Support hours, response commitments, monitoring and third-party costs are defined in the agreement. We do not imply round-the-clock coverage."
      />
      <section className="editorial-section">
        <Link href="/pricing" className="button-02">
          <span className="inner">How engagements work</span>
          <span className="circle" aria-hidden>
            <span>→</span>
          </span>
        </Link>
      </section>
      <EditorialClose />
    </LibraryMotion>
  );
}
