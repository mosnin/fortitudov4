import Image from "next/image";
import Link from "next/link";
import { SERVICE_CATALOG, servicePdf, servicePreview } from "@/lib/service-catalog";
import manifest from "@/content/resource-manifest.json";
import { SectionHeading } from "./section-heading";
export function ResourceCards({ featured = false }: { featured?: boolean }) {
  const entries = featured
    ? SERVICE_CATALOG.filter((s) =>
        ["ecommerce", "software-solutions", "ai-solutions"].includes(s.slug),
      )
    : SERVICE_CATALOG;
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {featured && (
          <SectionHeading
            id="resources-heading"
            title="The details, ready to share."
            description="Service pitches to read, download and share with your team. Scope, delivery and ownership in one place."
            aside={
              <Link
                href="/resources"
                className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
              >
                All pitch decks →
              </Link>
            }
          />
        )}
        <div
          className={`grid gap-x-6 gap-y-14 md:grid-cols-2 ${featured ? "mt-12 lg:grid-cols-3" : "lg:grid-cols-3"}`}
        >
          {entries.map((s) => {
            const file = manifest.find((p) => p.slug === s.resourceSlug);
            return (
              <article key={s.slug}>
                <Link
                  href={`/resources/${s.resourceSlug}`}
                  className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
                    <Image
                      src={servicePreview(s)}
                      alt={`${s.name} service pitch cover`}
                      fill
                      sizes="(min-width:1024px) 33vw,(min-width:768px) 50vw,100vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="mt-5 text-xs text-muted-foreground">
                    SERVICE DECK · PDF{file ? ` · ${file.pages} PAGES` : ""}
                  </p>
                  <h2 className="mt-3 text-2xl tracking-tight">{s.name}</h2>
                </Link>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {s.lead}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link
                    className="inline-flex min-h-11 items-center underline underline-offset-4"
                    href={`/resources/${s.resourceSlug}`}
                  >
                    Read the service overview →
                  </Link>
                  <a
                    href={servicePdf(s)}
                    download
                    className="inline-flex min-h-11 items-center underline underline-offset-4"
                  >
                    Download PDF ↓
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
