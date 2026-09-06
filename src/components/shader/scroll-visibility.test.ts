import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RevealHeadline } from "./reveal-headline";
import { ValueProp, VALUE_PROP_ANIMATION } from "./value-prop";
import { Providers } from "./providers";

function textContent(markup: string): string {
  return markup.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function classLists(markup: string): string[][] {
  return [...markup.matchAll(/class="([^"]*)"/g)].map((match) =>
    match[1].split(/\s+/),
  );
}

function expectVisibleFirstPaint(markup: string): void {
  expect(markup).not.toMatch(/visibility:\s*hidden|display:\s*none|opacity:\s*0(?:[;"\s]|$)/);
  expect(markup).not.toMatch(/\s(?:hidden|inert)(?:[\s=>])/);
  for (const classes of classLists(markup)) {
    // A secondary CTA follows the theme's desktop-only treatment. Responsive
    // visibility is not a hydration gate; unconditional hidden content is.
    expect(classes.filter((name) => !/^max-\[850px\]:/.test(name))).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/(?:^|:)(?:hidden|invisible|opacity-0)$/)]),
    );
  }
}

/**
 * These render the real components in Vitest's node environment: effects,
 * intersection observers and WebGL never run. They guard the first HTML a
 * visitor receives when hydration is slow, disabled, or interrupted.
 */
describe("below-hero content without browser animation", () => {
  const markup = renderToStaticMarkup(createElement(ValueProp));

  it("includes every outcome and its explanation in the server HTML", () => {
    const content = textContent(markup);
    for (const copy of [
      "Websites, software, and AI, built around your business.",
      "Websites and ecommerce",
      "Help customers find the right product, understand the details, and complete a purchase or enquiry on any screen.",
      "Software and AI",
      "Connect customer records, requests, and approvals in software your team can use, with clear limits on what AI can do.",
      "Marketing and consultation",
      "Plan the campaign, build its landing page, and check the path from the first click to an enquiry, booking, or sale.",
    ]) {
      expect(content).toContain(copy);
    }
    expect([...markup.matchAll(/data-value-prop-panel=""/g)]).toHaveLength(3);
    expectVisibleFirstPaint(markup);
  });

  it("offers a real contact link before client JavaScript runs", () => {
    const contactLink = markup.match(/<a\b[^>]*href="\/contact"[^>]*>[\s\S]*?<\/a>/)?.[0];
    expect(contactLink).toBeDefined();
    expect(textContent(contactLink!)).toBe("Discuss a project");
    expectVisibleFirstPaint(contactLink!);
  });

  it("keeps all panels readable until animation successfully enhances them", () => {
    expect(markup).not.toContain('data-enhanced="true"');
    expect(markup).not.toContain("pin-spacer");
    const panels = [...markup.matchAll(/<div\b[^>]*data-value-prop-panel=""[^>]*>/g)];
    expect(panels).toHaveLength(3);
    for (const [panel] of panels) {
      expectVisibleFirstPaint(panel);
      // Positions prefixed by group-data-[enhanced=true] belong to the paid
      // animation. They are inactive in server HTML and reduced motion.
      const defaultClasses = classLists(panel).flat().filter((className) => !className.includes(":"));
      expect(defaultClasses).toContain("relative");
      expect(defaultClasses).not.toEqual(expect.arrayContaining([
        expect.stringMatching(/^(?:absolute|fixed|sticky|h-screen)$/),
      ]));
    }
  });

  it("retains the original ribbon host and panel counters", () => {
    expect(markup).toMatch(/data-value-prop-wave=""[^>]*aria-hidden="true"/);
    // The real WaveShader renders a decorative host on the server, then
    // creates its WebGL canvas after hydration. Do not replace it with a row.
    expect(markup).toMatch(/data-value-prop-wave=""[^>]*><div aria-hidden="true"[^>]*style="[^"]*pointer-events:none/);
    for (const number of ["01", "02", "03"]) {
      expect(markup).toMatch(new RegExp(`>${number}<span[^>]*>\\/</span>03</span>`));
    }
    expect(markup).toContain("group-data-[enhanced=true]/value-prop:h-[58%]");
  });

  it("renders with the real motion, shader, and scrolling providers without browser APIs", () => {
    const props = { children: createElement(ValueProp) };
    const integratedMarkup = renderToStaticMarkup(createElement(Providers, props));
    expectVisibleFirstPaint(integratedMarkup);
    expect(textContent(integratedMarkup)).toContain("Websites and ecommerce");
    expect(integratedMarkup).toContain('data-value-prop-wave=""');
    expect([...integratedMarkup.matchAll(/data-value-prop-panel=""/g)]).toHaveLength(3);
    expect(integratedMarkup).not.toContain('data-enhanced="true"');
  });

  it("does not exclude mobile widths or coarse pointers from the original sequence", () => {
    expect(VALUE_PROP_ANIMATION).not.toMatch(/min-width|pointer/);
    expect(VALUE_PROP_ANIMATION).toContain("prefers-reduced-motion: no-preference");
    const source = readFileSync("src/components/shader/value-prop.tsx", "utf8");
    expect(source).toContain("autoAlpha: 0, duration: 0.15");
    expect(source).toContain("autoAlpha: 1, duration: 0.15");
    expect(source).not.toContain("Math.floor(self.progress");
  });
});

describe("headlines before intersection observers run", () => {
  it.each([undefined, 3])("renders readable words with mutedFrom=%s", (mutedFrom) => {
    const copy = "Make the next move for your business.";
    const props = {
      children: copy,
      as: "h2" as const,
      id: "readable-heading",
      mutedFrom,
    };
    const markup = renderToStaticMarkup(
      createElement(RevealHeadline, props),
    );

    expect(markup).toContain('<h2 id="readable-heading">');
    expect(textContent(markup)).toBe(copy);
    expectVisibleFirstPaint(markup);
    const covers = [...markup.matchAll(/<span\b[^>]*data-reveal-cover=""[^>]*>/g)];
    expect(covers).toHaveLength(copy.split(" ").length);
    for (const [cover] of covers) {
      // Keep the purchased word-wipe, but its unhydrated position must be
      // below the word. Intersection observation opts into the animation.
      expect(cover).toContain('aria-hidden="true"');
      expect(cover).toContain("translateY(110%)");
      expect(cover).not.toContain('data-running="true"');
    }
  });

  it("has an independent CSS deadline and reduced-motion bypass for word covers", () => {
    const css = readFileSync("src/components/shader/reveal-headline.module.css", "utf8");
    expect(css).toMatch(/\.cover\s*\{[^}]*visibility:\s*hidden/);
    expect(css).toMatch(/animation:\s*release-cover\s+1ms\s+step-end\s+var\(--reveal-timeout,\s*1s\)\s+both/);
    expect(css).toMatch(/@keyframes release-cover\s*\{[\s\S]*to\s*\{\s*visibility:\s*hidden/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*visibility:\s*hidden\s*!important/);
  });
});
