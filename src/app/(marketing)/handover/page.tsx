import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  EditorialHero,
  ScopeNotes,
  EditorialClose,
  SourceAccordion,
} from "@/components/imageworks/expansion";
export const metadata = {
  title: "Ownership & handover | Fortitudo",
  description:
    "Understand the files, access, documentation and responsibilities included in your project handover.",
};
const items = [
  [
    "The work",
    "The agreed source files, repository and brand or design materials, with third-party licenses identified.",
  ],
  [
    "The access",
    "The accounts and infrastructure access needed to run the delivered system, transferred or configured as agreed.",
  ],
  [
    "The knowledge",
    "Documentation for setup, routine operation and the integrations your team will maintain.",
  ],
  [
    "The next step",
    "A clear boundary between the completed project and optional maintenance, support or further development.",
  ],
];
export default function Page() {
  return (
    <LibraryMotion>
      <EditorialHero
        label="Ownership & handover"
        title="Built for you. Ready for your team."
        lead="A finished project includes a practical handover. The proposal defines what you receive, how access transfers and who is responsible after launch."
      />
      <section className="editorial-section handover-list">
        {items.map(([title, body], i) => (
          <article key={title}>
            <span className="editorial-number">0{i + 1}</span>
            <h2 data-reveal-02="lines" data-scroll data-once>
              {title}
            </h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <ScopeNotes
        inputs="Nominate the people who will own the accounts, maintain the product and receive the documentation."
        boundary="Ownership transfers on full payment under the agreed terms. Third-party software, platform accounts and licenses retain their own conditions."
      />
      <section className="editorial-section">
        <SourceAccordion
          id="handover"
          items={[
            {
              question: "Can another team take over?",
              answer:
                "The agreed repository, access and documentation support a handover to your team or another provider. Any additional training or migration work is scoped explicitly.",
            },
            {
              question: "Are subscriptions included?",
              answer:
                "Third-party subscriptions, hosting, usage charges and license costs are identified separately in the proposal.",
            },
            {
              question: "Is ongoing support required?",
              answer:
                "Support is a separate scope. The handover makes clear what you can operate yourself and what an ongoing engagement would cover.",
            },
          ]}
        />
      </section>
      <EditorialClose />
    </LibraryMotion>
  );
}
