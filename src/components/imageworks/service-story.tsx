import Image from "next/image";
import { SectionHeading } from "./section-heading";

const STORIES = {
  ecommerce: {
    title: "One brand. Every part of the purchase.",
    description:
      "The label, product image and store should tell the same story. We design them together, then connect the systems that take an order through to fulfilment.",
    frames: [
      {
        image: "forme-packaging",
        title: "Make the product recognisable.",
        body: "Identity, label hierarchy and packaging give the product a consistent presence before a customer ever reaches the checkout.",
        caption: "Forme · studio packaging concept",
      },
      {
        image: "forme-storefront",
        title: "Make the decision straightforward.",
        body: "Clear product information, purchase options and a considered cart connect the brand to the practical work of buying.",
        caption: "Forme · studio storefront concept",
      },
    ],
  },
  "ai-solutions": {
    title: "Context in. Useful work out.",
    description:
      "An agent needs access to the right information, a defined job and a way to check its work. Those decisions shape the system before we choose the models.",
    frames: [
      {
        image: "stored-context",
        title: "Give the system the right context.",
        body: "Connect source documents, shared memory and tools with explicit access rules. Keep the information traceable as it moves between agents.",
        caption: "Stored · conceptual illustration of shared context",
      },
      {
        image: "creative-workflow",
        title: "Keep creative work under control.",
        body: "Bring image, video and audio generation into a repeatable workflow, with brand context, version review and a person accountable for the final result.",
        caption: "Forme · studio concept for a creative production workflow",
      },
    ],
  },
  brand: {
    title: "An identity has to work in the world.",
    description:
      "We develop the rules and put them to use across the places people encounter your business: screens, products, packaging and campaign materials.",
    frames: [
      {
        image: "fortitudo-identity",
        title: "A mark with a consistent presence.",
        body: "The logo, type, colour and material direction belong to one system, with clear guidance for the people who will use it.",
        caption: "Fortitudo · studio identity",
      },
      {
        image: "forme-packaging",
        title: "The details carry the identity.",
        body: "Labels, hierarchy and packaging extend the brand into a physical product. The same decisions carry through to the store and its content.",
        caption: "Forme · studio packaging concept",
      },
    ],
  },
};

export function ServiceStory({ slug }: { slug: string }) {
  const story = STORIES[slug as keyof typeof STORIES];
  if (!story) return null;
  return (
    <section aria-labelledby="service-story-heading" className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="service-story-heading"
          title={story.title}
          description={story.description}
        />
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {story.frames.map((frame) => (
            <article key={frame.image}>
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={`/studio/${frame.image}.webp`}
                    alt={frame.caption}
                    fill
                    sizes="(min-width:768px) 50vw,100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-xs text-muted-foreground">
                  {frame.caption}
                </figcaption>
              </figure>
              <h3 className="mt-6 text-2xl tracking-tight">{frame.title}</h3>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
                {frame.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
