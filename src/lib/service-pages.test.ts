import { describe, expect, it } from "vitest";
import { services } from "@/lib/services";
import { getServicePage, getServicePageById, SERVICE_PAGE_HREFS, SERVICE_PAGES, PUBLIC_SERVICE_PAGES, ECOMMERCE_PAGE } from "./service-pages";
import { WORK_PROJECTS } from "./work-projects";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("public service routes", () => {
  it("gives every canonical offering one unique detail route", () => {
    expect(new Set(SERVICE_PAGES.map((page) => page.slug)).size).toBe(services.length);
    expect(new Set(SERVICE_PAGES.map((page) => page.serviceId)).size).toBe(services.length);
    for (const service of services) {
      const page = getServicePageById(service.id);
      expect(page, service.id).toBeDefined();
      expect(page?.name).toBe(service.name);
      expect(SERVICE_PAGE_HREFS[service.id]).toBe(`/services/${page?.slug}`);
      expect(getServicePage(page!.slug)).toBe(page);
    }
  });

  it("uses published project imagery in metadata, not invented concepts", () => {
    for (const page of PUBLIC_SERVICE_PAGES) {
      expect(WORK_PROJECTS.some((project) => project.image === page.image)).toBe(true);
      expect(page.image).not.toContain("brand-stories");
      expect(page.imageAlt.length).toBeGreaterThan(20);
      expect(readFileSync(resolve(process.cwd(), `public${page.image}`)).length).toBeGreaterThan(1000);
    }
  });

  it("links only existing published projects and matches specialist proof", () => {
    for (const page of PUBLIC_SERVICE_PAGES) {
      expect(new Set(page.proof.slugs).size).toBe(page.proof.slugs.length);
      for (const slug of page.proof.slugs) {
        const project = WORK_PROJECTS.find((item) => item.slug === slug);
        expect(project, `${page.slug}: ${slug}`).toBeDefined();
        if (["Websites", "Software Solutions", "AI Solutions"].includes(page.name)) {
          expect(project?.service).toBe(page.name);
        }
      }
    }
  });

  it("adds ecommerce as a Websites specialization without changing product offerings", () => {
    expect(services).toHaveLength(5);
    expect(PUBLIC_SERVICE_PAGES).toHaveLength(6);
    expect(getServicePage("ecommerce")).toBe(ECOMMERCE_PAGE);
    expect(ECOMMERCE_PAGE.serviceId).toBe("websites");
    expect(getServicePageById("websites")?.slug).toBe("websites");
    expect(ECOMMERCE_PAGE.proof.slugs).toEqual(["nourish-reserve"]);
    expect(ECOMMERCE_PAGE.scope.deliverables.join(" ")).toContain("checkout");
    expect(readFileSync("src/app/sitemap.ts", "utf8")).toContain('path: "/services/ecommerce"');
  });

  it("does not resolve unsupported offerings or near-match route slugs", () => {
    for (const slug of ["", "branding", "software_solutions", "AI-Solutions", "websites/extra"]) {
      expect(getServicePage(slug)).toBeUndefined();
    }
  });
});
