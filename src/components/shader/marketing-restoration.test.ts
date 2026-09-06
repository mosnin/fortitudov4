import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Nav } from "./nav";
import { HeroExperience } from "./hero-experience";
import { ServiceDetail } from "./service-detail";
import { PUBLIC_SERVICE_PAGES } from "@/lib/service-pages";
import MarketingTemplate from "@/app/(marketing)/template";
import { getVariantById } from "./lib/shader-variants";

describe("purchased theme restoration", () => {
  it("renders matching transparent nav surfaces and discoverable sign-in before hydration", () => {
    const html = renderToStaticMarkup(createElement(Nav));
    for (const marker of ["data-nav-brand", "data-nav-controls"]) {
      const tag = html.match(new RegExp(`<div[^>]*${marker}[^>]*>`))?.[0];
      expect(tag).toContain("background-color:rgba(15,15,18,0)");
      expect(tag).toContain("color:#0f0f12");
    }
    expect(html).toContain('href="/sign-in"');
    expect(html).toContain("Sign in");
  });

  it("does not trap viewport pins in a page-wide filter or transform", () => {
    const html = renderToStaticMarkup(MarketingTemplate({ children: createElement("section", null, "Theme section") }));
    expect(html).toBe("<section>Theme section</section>");
  });

  it("keeps the whole ribbon color cycle visible against charcoal", () => {
    for (const [red, green] of getVariantById("fortitudo").wave) {
      expect(red).toBeGreaterThanOrEqual(0.7);
      expect(green).toBeGreaterThanOrEqual(0.5);
    }
  });

  it("renders the original hero surface without an added loading overlay", () => {
    const html = renderToStaticMarkup(createElement(HeroExperience));
    expect(html).toContain("data-shader-hero-surface");
    expect(html).not.toMatch(/data-fortitudo-intro|Loading\.\.\.|brand-stories/);
    expect(html).toContain("digital agency");
    for (const offer of ["websites", "ecommerce stores", "custom software", "consultation", "AI agents"]) expect(html).toContain(offer);
  });

  it.each(PUBLIC_SERVICE_PAGES)("does not render rejected artwork or disclaimers on $slug", (service) => {
    const html = renderToStaticMarkup(createElement(ServiceDetail, { service, projects: [] }));
    expect(html).not.toMatch(/brand-stories|FloatingArtwork|[Ii]llustrative|[Nn]ot a client project|editorial concept/);
    expect(html).toContain(service.title);
    expect(html).toContain("service-work");
  });

  it("keeps the original theme section order without the added artwork gallery", () => {
    const page = readFileSync("src/app/(marketing)/page.tsx", "utf8");
    const sequence = ["HeroExperience", "ValueProp", "Product", "Pillars", "Partners", "Pricing", "Faq", "FinalCta"];
    const rendered = [...page.matchAll(/<([A-Z]\w+) \/>/g)].map((match) => match[1]);
    expect(rendered).toEqual(sequence);
    expect(page).not.toContain("BrandShowcase");
  });
});
