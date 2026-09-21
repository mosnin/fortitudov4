import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
const steps = [
  [
    "Agree on the work",
    "We turn your brief into deliverables, responsibilities, milestones and a fixed project price. You can see what is included before deciding.",
  ],
  [
    "Review it as it takes shape",
    "Design and development move through agreed reviews. You give feedback on the working product, with decisions and files kept in your project workspace.",
  ],
  [
    "Launch and take ownership",
    "We test the agreed journeys and prepare the handover. Your team receives the code, design files, access and documentation under the project terms.",
  ],
];
export function Process() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="process-heading"
          title="Know what happens between the brief and the launch."
          description="A project should be easy to follow, even when the work behind it is complex."
        />
        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <ol className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-background md:grid-cols-3 md:divide-x md:divide-y-0">
            {steps.map(([title, body], i) => (
              <li key={title} className="p-6 sm:p-8">
                <p className="font-sans text-[3rem] leading-none text-foreground">
                  0{i + 1}
                </p>
                <h3 className="mt-8 text-lg font-medium">{title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
