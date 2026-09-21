import manifest from "@/content/resource-manifest.json";
import offers from "@/content/service-offers.json";
import catalog from "@/content/service-catalog.json";
import artwork from "@/content/service-art.json";
import type { ServiceType } from "@/lib/services";

export type ServiceCatalogEntry = Omit<
  (typeof catalog)[number],
  "serviceId"
> & { serviceId: ServiceType };
export const SERVICE_CATALOG = catalog as ServiceCatalogEntry[];
export const catalogService = (slug: string) =>
  SERVICE_CATALOG.find((s) => s.slug === slug);
export const resourceService = (slug: string) =>
  SERVICE_CATALOG.find((s) => s.resourceSlug === slug);
export const serviceArt = (s: ServiceCatalogEntry) =>
  `/studio/${artwork[s.slug as keyof typeof artwork].cover}`;
export const serviceArtCaption = (s: ServiceCatalogEntry) =>
  artwork[s.slug as keyof typeof artwork].caption;
export const servicePdf = (s: ServiceCatalogEntry) =>
  `/resources/fortitudo-${s.resourceSlug}.pdf`;

export const serviceOffer = (s: ServiceCatalogEntry) => offers[s.slug as keyof typeof offers];
export const serviceEnquiry = (s: ServiceCatalogEntry) => `/contact?service=${s.serviceId}&offer=${s.slug}`;

export const servicePreview = (s: ServiceCatalogEntry) => `/resources/previews/${s.resourceSlug}-${manifest.find(p => p.slug === s.resourceSlug)?.previewRevision ?? "current"}.webp`;
