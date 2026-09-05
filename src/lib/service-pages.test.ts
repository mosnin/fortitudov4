import { describe, expect, it } from "vitest";
import { services } from "@/lib/services";
import { getServicePage, getServicePageById, SERVICE_PAGE_HREFS, SERVICE_PAGES } from "./service-pages";
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

  it("uses the intentional editorial cutouts and genuine RGBA PNG exports", () => {
    const expected = {
      websites: "creative-presence",
      "software-solutions": "too-many-tools",
      "ai-solutions": "customer-conversations",
      consultation: "next-chapter",
      "digital-marketing": "creative-presence",
    };
    for (const page of SERVICE_PAGES) {
      expect(page.image).toBe(`/brand-stories/${expected[page.slug]}.webp`);
      expect(page.imageAlt).toContain("Original Fortitudo");
      const png = readFileSync(resolve(process.cwd(), `public${page.image.replace(/\.webp$/, ".png")}`));
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect(png[25]).toBe(6); // PNG IHDR color type 6 = RGBA, not a painted backdrop.
      expect(readFileSync(resolve(process.cwd(), `public${page.image}`)).length).toBeGreaterThan(1000);
    }
  });

  it("links only existing published projects and matches specialist proof", () => {
    for (const page of SERVICE_PAGES) {
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

  it("gives every service a distinct deliverable, separate from its editorial portrait", () => {
    expect(new Set(SERVICE_PAGES.map((page) => page.delivery.image)).size).toBe(5);
    for (const page of SERVICE_PAGES) {
      expect(page.delivery.image).not.toBe(page.image);
      expect(page.delivery.title.length).toBeGreaterThan(15);
      expect(page.delivery.body.length).toBeGreaterThan(100);
      const png = readFileSync(resolve(process.cwd(), `public${page.delivery.image.replace(/\.webp$/, ".png")}`));
      expect(png[25]).toBe(6);
      expect(readFileSync(resolve(process.cwd(), `public${page.delivery.image}`)).length).toBeGreaterThan(1000);
    }
  });

  it("does not resolve unsupported offerings or near-match route slugs", () => {
    for (const slug of ["", "branding", "software_solutions", "AI-Solutions", "websites/extra"]) {
      expect(getServicePage(slug)).toBeUndefined();
    }
  });
});
