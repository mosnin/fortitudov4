import Link from "next/link";
import { RollingArrow } from "./arrow-chip";
import { RevealHeadline } from "./reveal-headline";
import { FloatingArtwork } from "./floating-artwork";

const STORIES = [
  {
    category: "Software",
    variant: "software",
    title: "Bring the work into one place.",
    body: "Bookings in one tab. Payments in another. Customer details in a spreadsheet. We build software that connects the work, so your team can stop piecing the day together.",
    image: "/brand-stories/connected-workspace.webp",
    alt: "",
    links: [{ label: "Explore software solutions", href: "/services/software-solutions" }],
  },
  {
    category: "AI",
    variant: "ai",
    title: "Give your team some time back.",
    body: "We build AI workflows that sort enquiries, prepare replies, and keep information moving. Your team reviews the important decisions instead of repeating the same steps.",
    image: "/brand-stories/enquiry-to-booking.webp",
    alt: "",
    links: [{ label: "Explore AI solutions", href: "/services/ai-solutions" }],
  },
  {
    category: "Creative",
    variant: "creative",
    title: "Make the business look as good as it is.",
    body: "A strong first impression should lead somewhere useful. We connect your website, campaign, and follow-up so people understand the offer and know how to buy, book, or get in touch.",
    image: "/brand-stories/campaign-in-the-world.webp",
    alt: "",
    links: [
      { label: "Explore websites", href: "/services/websites" },
      { label: "Explore digital marketing", href: "/services/digital-marketing" },
    ],
  },
  {
    category: "Strategy",
    variant: "strategy",
    title: "Work out what is worth building.",
    body: "Bring us the problem, the idea, or the system you have outgrown. We will help you decide what to fix first, what to keep, and what can wait.",
    image: "/brand-stories/idea-to-roadmap.webp",
    alt: "",
    links: [{ label: "Explore consultation", href: "/services/consultation" }],
  },
] as const;

export function BrandShowcase() {
  return (
    <section id="possibilities" aria-labelledby="brand-showcase-heading" className="bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-16 grid grid-cols-12 gap-x-10 gap-y-6 max-[850px]:grid-cols-1">
          <div className="col-span-3 pt-2 max-[1100px]:col-span-12 max-[850px]:col-span-1"><span className="inline-flex rounded-md border border-foreground/[0.08] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-foreground/70">Ideas made real</span></div>
          <div className="col-span-7 col-start-6 max-[1100px]:col-span-12 max-[1100px]:col-start-1 max-[850px]:col-span-1">
            <RevealHeadline id="brand-showcase-heading" className="text-balance text-[clamp(2rem,4.2vw,4rem)] font-medium leading-[0.9] tracking-tight">What would you change first?</RevealHeadline>
            <p className="mt-6 max-w-[60ch] text-lg leading-snug text-foreground/75 sm:text-xl">The daily admin. The missed enquiry. The website you keep meaning to improve. Start with the thing that is getting in your way.</p>
          </div>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-white/65">Illustrative concepts and interfaces, not client projects. Explore the real work below.</p>
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:gap-y-20">
          {STORIES.map((story) => (
            <article key={story.category}>
              <FloatingArtwork src={story.image} alt={story.alt} decorative variant={story.variant} sizes="(min-width: 1760px) 828px, (min-width: 768px) 48vw, 100vw" />
              <div className="pt-5 lg:pt-6">
                <p className="text-sm text-white/65 lg:text-base">{story.category}</p>
                <h3 className="mt-3 max-w-[30ch] text-[clamp(1.6rem,2.35vw,2.3rem)] font-medium leading-tight tracking-tight">{story.title}</h3>
                <p className="mt-3 max-w-[54ch] text-base leading-relaxed text-white/75 lg:text-lg">{story.body}</p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                  {story.links.map((link) => <Link key={link.href} href={link.href} className="group inline-flex items-center gap-3 text-sm leading-relaxed text-[#f8cd02] underline decoration-[#f8cd02]/30 underline-offset-4 hover:decoration-[#f8cd02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8cd02]">{link.label}<span className="shrink-0" aria-hidden><RollingArrow iconSize={16} /></span></Link>)}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 border-t border-white/15 pt-7 lg:mt-16">
          <p className="mb-4 text-base leading-relaxed text-white/75">10+ years. Hundreds of complex builds.</p>
          <Link href="/work" className="group inline-flex items-center gap-4 text-base font-medium hover:text-[#f8cd02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8cd02]">Explore the work behind the advice<RollingArrow iconSize={20} /></Link>
        </div>
      </div>
    </section>
  );
}
