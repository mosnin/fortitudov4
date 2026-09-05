import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RevealHeadline } from "./reveal-headline";
import { ValueProp } from "./value-prop";
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
    expect(classes).not.toEqual(
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
      "Your business is ready for more. Your systems should be, too.",
      "A great product can still get lost in a confusing website.",
      "A busy team can still lose hours to disconnected tools.",
      "Turn interest into action.",
      "Give people a clear reason to buy, book, or get in touch—and an easy way to do it.",
      "Get your time back.",
      "Connect the tools, handoffs, and repetitive work that keep pulling you away from the business.",
      "Build what comes next.",
      "Launch the store, app, or platform you have been putting off with a team that can handle the hard parts.",
    ]) {
      expect(content).toContain(copy);
    }
    expect([...markup.matchAll(/data-value-prop-panel=""/g)]).toHaveLength(3);
    expectVisibleFirstPaint(markup);
  });

  it("offers a real contact link before client JavaScript runs", () => {
    const contactLink = markup.match(/<a\b[^>]*href="\/contact"[^>]*>[\s\S]*?<\/a>/)?.[0];
    expect(contactLink).toBeDefined();
    expect(textContent(contactLink!)).toBe("Talk through your project");
    expectVisibleFirstPaint(contactLink!);
  });

  it("keeps all panels readable until desktop animation successfully enhances them", () => {
    expect(markup).not.toContain('data-enhanced="true"');
    expect(markup).not.toContain("pin-spacer");
    const panels = [...markup.matchAll(/<div\b[^>]*data-value-prop-panel=""[^>]*>/g)];
    expect(panels).toHaveLength(3);
    for (const [panel] of panels) {
      expectVisibleFirstPaint(panel);
      // Positions prefixed by group-data-[enhanced=true] belong to the paid
      // desktop animation. They are inactive in mobile and server HTML.
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
    expect(textContent(integratedMarkup)).toContain("Turn interest into action.");
    expect(integratedMarkup).toContain('data-value-prop-wave=""');
    expect([...integratedMarkup.matchAll(/data-value-prop-panel=""/g)]).toHaveLength(3);
    expect(integratedMarkup).not.toContain('data-enhanced="true"');
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
