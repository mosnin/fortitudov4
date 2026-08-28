import type { Metadata } from 'next';
import { PageHero } from '@/components/shader/page-hero';
import { WorkGrid } from '@/components/shader/work-grid';

export const metadata: Metadata = {
  title: 'Our Work — Fortitudo',
  description:
    'A selection of websites, software products and AI experiences built by Fortitudo.',
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Selected work"
        title="Digital products made to be used."
        lead="Eight client builds, shown through the work itself. Explore the live product, the thinking behind it and the exact part of the experience Fortitudo helped bring to life."
      />
      <WorkGrid />
    </>
  );
}
