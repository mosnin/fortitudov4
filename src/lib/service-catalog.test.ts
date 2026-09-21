import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SERVICE_CATALOG, serviceEnquiry, serviceOffer, servicePdf, servicePreview, resourceService } from "./service-catalog";
import manifest from "../content/resource-manifest.json";

describe("public service journeys", () => {
  it("keeps the user’s core services and dedicated AI implementations available", () => {
    expect(SERVICE_CATALOG.map(s => s.slug).sort()).toEqual(["websites", "ecommerce", "software-solutions", "ai-solutions", "brand", "unslop", "consultation", "agent-teams", "agent-infrastructure", "jev-implementation", "context-and-memory", "mcp-and-api", "creative-ai-workflows", "ai-setup-and-consulting"].sort());
  });
  for (const service of SERVICE_CATALOG) {
    it(`${service.name} has a complete offer, enquiry and real downloadable pitch`, () => {
      const offer = serviceOffer(service);
      expect(offer.name.length).toBeGreaterThan(5);
      expect(offer.deliverables.length).toBeGreaterThanOrEqual(3);
      expect(offer.acceptance.length).toBeGreaterThanOrEqual(2);
      expect(offer.faq.length).toBeGreaterThanOrEqual(2);
      const query = new URL(serviceEnquiry(service), "https://fortitudo.agency").searchParams;
      expect(query.get("offer")).toBe(service.slug);
      expect(["websites", "software_solutions", "ai_solutions", "consultation", "digital_marketing"]).toContain(query.get("service"));
      expect(resourceService(service.resourceSlug)?.slug).toBe(service.slug);
      const file = join(process.cwd(), "public", servicePdf(service));
      expect(readFileSync(file).subarray(0, 5).toString()).toBe("%PDF-");
      expect(existsSync(join(process.cwd(), "public/resources/previews", `${service.resourceSlug}.webp`))).toBe(true);
      expect(servicePreview(service)).toMatch(/-[a-f0-9]{12}\.webp$/);
      expect(existsSync(join(process.cwd(), "public", servicePreview(service)))).toBe(true);
      expect(manifest.find(p => p.slug === service.resourceSlug)?.pages).toBeGreaterThanOrEqual(6);
    });
  }
  it("preserves the complete detailed offer inventory", () => {
    const ids = new Set(SERVICE_CATALOG.flatMap(s => s.packages.map(p => p.id)));
    expect(ids.size).toBeGreaterThanOrEqual(32);
  });
});
