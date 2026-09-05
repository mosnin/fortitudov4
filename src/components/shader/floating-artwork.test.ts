import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FloatingArtwork } from "./floating-artwork";

describe("floating artwork before animation or browser APIs are available", () => {
  it.each(["software", "ai", "creative", "strategy", "websites"] as const)(
    "renders a visible, accessible %s image in a transparent portrait container",
    (variant) => {
      const markup = renderToStaticMarkup(createElement(FloatingArtwork, {
        src: "/brand-stories/example.png",
        alt: "A sculptural product and a floating digital interface",
        variant,
      }));

      expect(markup).toContain(`data-floating-artwork="${variant}"`);
      expect(markup).toContain('alt="A sculptural product and a floating digital interface"');
      expect(markup).toContain('data-nimg="fill"');
      expect(markup).toContain("aspect-[4/5]");
      expect(markup).toContain("object-contain");
      expect(markup).not.toMatch(/opacity:\s*0|visibility:\s*hidden|display:\s*none|<canvas/);
      const classes = [...markup.matchAll(/class="([^"]*)"/g)].flatMap((match) => match[1].split(/\s+/));
      expect(classes.some((token) => /^(?:bg-|border|overflow-hidden|hidden|invisible)/.test(token))).toBe(false);
    },
  );

  it("keeps caller sizing and image semantics without adding moving captions", () => {
    const markup = renderToStaticMarkup(createElement(FloatingArtwork, {
      src: "/brand-stories/example.png",
      alt: "",
      sizes: "(max-width: 850px) 100vw, 50vw",
      className: "max-w-lg",
    }));

    expect(markup).toContain('sizes="(max-width: 850px) 100vw, 50vw"');
    expect(markup).toContain('alt=""');
    expect(markup).toContain("max-w-lg");
    expect(markup).not.toMatch(/<(?:figcaption|p|h[1-6])\b/);
  });

  it("does not announce fictional product interfaces as real data", () => {
    const markup = renderToStaticMarkup(createElement(FloatingArtwork, {
      src: "/brand-stories/connected-workspace.webp",
      alt: "Fictional example",
      decorative: true,
    }));
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('alt=""');
    expect(markup).not.toContain('alt="Fictional example"');
  });
});
