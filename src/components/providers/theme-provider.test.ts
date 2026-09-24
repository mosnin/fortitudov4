import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "./theme-provider";

const state = vi.hoisted(() => ({ segment: null as string | null }));
vi.mock("next/navigation", () => ({ useSelectedLayoutSegment: () => state.segment }));
vi.mock("next-themes", () => ({
  ThemeProvider: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-default": props.defaultTheme,
      "data-storage": props.storageKey,
      "data-system": String(props.enableSystem),
    }),
}));

describe("theme ownership follows the root route group", () => {
  it.each(["(marketing)", "(auth)"])("keeps %s on the public preference", (segment) => {
    state.segment = segment;
    const html = renderToStaticMarkup(createElement(ThemeProvider, null, null));
    expect(html).toContain('data-default="dark"');
    expect(html).toContain('data-storage="fortitudo-marketing-theme"');
    expect(html).toContain('data-system="true"');
  });

  it.each(["(admin)", "(dashboard)", "(partner)", "checkout", null])(
    "preserves the separate application preference for %s", (segment) => {
      state.segment = segment;
      const html = renderToStaticMarkup(createElement(ThemeProvider, null, null));
      expect(html).toContain('data-default="light"');
      expect(html).toContain('data-storage="theme"');
      expect(html).toContain('data-system="false"');
    },
  );
});
