import { notFound } from "next/navigation";
import { SOLUTIONS } from "@/content/solution-pathways";
import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  EditorialHero,
  DeliveryStack,
  ScopeNotes,
  RelatedServices,
  EditorialClose,
} from "@/components/imageworks/expansion";
export function generateStaticParams() {
  return SOLUTIONS.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = SOLUTIONS.find((s) => s.slug === slug);
  return {
    title: s ? `${s.label} | Fortitudo` : "Solution not found",
    description: s?.lead,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = SOLUTIONS.find((s) => s.slug === slug);
  if (!s) notFound();
  return (
    <LibraryMotion>
      <EditorialHero
        label={s.label}
        title={s.title}
        lead={s.lead}
        effect={s.slug === "apply-ai" ? "05" : "01"}
      />
      <div className="editorial-fit">
        <span>Built for</span>
        <p>{s.fit}</p>
      </div>
      <DeliveryStack steps={s.steps} />
      <ScopeNotes inputs={s.inputs} boundary={s.boundary} />
      <RelatedServices slugs={s.services} />
      <EditorialClose />
    </LibraryMotion>
  );
}
