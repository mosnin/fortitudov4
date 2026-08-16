// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..10 as the
// carousel turns. (Upstream comment, still true.)
//
// ADAPTED: the list is derived from the site's one source of truth for client
// work, `src/lib/work-projects.ts` — the same module the /work/[slug] pages
// read — so the ring, the lockups, the column and the case pages can never
// disagree. The right-hand lockup shows [service . domain] rather than the
// demo's [type . year]: the domain is a fact we hold; the years are not ours
// to invent.

import { WORK_PROJECTS } from '@/lib/work-projects';

export const PROJECTS = WORK_PROJECTS.map((p) => ({
  file: p.art,
  name: p.name,
  type: p.service,
  year: p.domain ?? p.locale ?? '—',
  slug: p.slug,
}));

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
