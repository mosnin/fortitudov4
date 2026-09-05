import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/shader/service-detail";
import { getServicePage, SERVICE_PAGES } from "@/lib/service-pages";
import { WORK_PROJECTS } from "@/lib/work-projects";

export function generateStaticParams() {
  return SERVICE_PAGES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) notFound();

  return {
    title: `${service.name} — Fortitudo Agency`,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} — Fortitudo Agency`,
      description: service.description,
      images: [{ url: service.image, alt: service.imageAlt }],
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) notFound();

  const projects = service.proof.slugs.flatMap((projectSlug) => {
    const project = WORK_PROJECTS.find((item) => item.slug === projectSlug);
    return project ? [project] : [];
  });

  return <ServiceDetail service={service} projects={projects} />;
}
