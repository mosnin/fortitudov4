import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const cookieState = vi.hoisted(() => ({ invited: false }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => cookieState.invited ? { value: "1" } : undefined }) }));
vi.mock("@/components/auth/auth-page-layout", () => ({ AuthPageLayout: ({ children }: { children: React.ReactNode }) => createElement("main", null, children) }));
vi.mock("@/components/auth/clerk-sign-in", () => ({ ThemedSignIn: ({ forceRedirectUrl }: { forceRedirectUrl: string }) => createElement("div", { "data-provider-sign-in": forceRedirectUrl }, "Provider sign in") }));
vi.mock("@/components/auth/clerk-sign-up", () => ({ ThemedSignUp: () => createElement("div", null, "Provider sign up") }));
vi.mock("@/components/auth/invite-gate", () => ({ InviteGate: () => createElement("div", null, "Invitation required") }));

import SignInPage from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import SignUpPage from "@/app/(auth)/sign-up/[[...sign-up]]/page";

describe("existing-user sign in versus account creation", () => {
  it("allows a fresh browser to reach the provider sign-in form", async () => {
    cookieState.invited = false;
    const html = renderToStaticMarkup(await SignInPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("Provider sign in");
    expect(html).not.toContain("Invitation required");
    expect(html).toContain('data-provider-sign-in="/post-login"');
    expect(html).toContain('href="/sign-up"');
  });
  it("preserves safe internal return paths", async () => {
    const html = renderToStaticMarkup(await SignInPage({ searchParams: Promise.resolve({ redirect_url: "/dashboard/projects" }) }));
    expect(html).toContain('data-provider-sign-in="/dashboard/projects"');
  });
  it("does not redirect to an external URL", async () => {
    const html = renderToStaticMarkup(await SignInPage({ searchParams: Promise.resolve({ redirect_url: "https://example.com" }) }));
    expect(html).toContain('data-provider-sign-in="/post-login"');
  });
  it("still requires an invitation before rendering account creation", async () => {
    cookieState.invited = false;
    const html = renderToStaticMarkup(await SignUpPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("Invitation required");
    expect(html).not.toContain("Provider sign up");
  });
});
