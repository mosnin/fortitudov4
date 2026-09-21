/** Original studio concepts illustrating client deliverables, not agency products.
 * Preserve the purchased theme's rendering and use small local WebGL textures.
 */
export const PHOTOS = [
  "websites", "perfume", "software", "commerce-detail", "accessories",
  "booking", "brand-packaging", "ai-agents", "storefront", "knowledge",
] as const;

export type PhotoId = (typeof PHOTOS)[number];

export function photoUrl(id: PhotoId, size: number): string {
  return `/campaign/${id}${size <= 800 ? "-640" : ""}.webp`;
}

export function photoSrc(id: PhotoId, w: number, h: number): string {
  if (id === "commerce-detail" && w > h) return "/campaign/commerce-detail-wide.webp";
  return photoUrl(id, Math.max(w, h));
}
