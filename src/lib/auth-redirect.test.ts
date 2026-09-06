import { describe, expect, it } from "vitest";
import { postLoginUrl, safeAuthDestination } from "./auth-redirect";

describe("post-login destinations", () => {
  it.each(["https://fortitudo.agency", "https://www.fortitudo.agency"])("normalizes the provider return URL from %s into a local path", origin => {
    expect(safeAuthDestination(`${origin}/projects/abc?tab=files`)).toBe('/projects/abc?tab=files');
    expect(postLoginUrl(`${origin}/projects/abc`)).toBe('/post-login?redirect_url=%2Fprojects%2Fabc');
  });
  it.each(["/projects/abc", "/admin/team", "/partner/requests/abc", "/checkout?service=websites", "/messages#latest"])("preserves %s only behind account setup", path => {
    expect(safeAuthDestination(path)).toBe(path);
    expect(postLoginUrl(path)).toBe(`/post-login?redirect_url=${encodeURIComponent(path)}`);
  });
  it.each([undefined, "https://evil.example", "https://www.fortitudo.agency.evil.example/projects", "https://evil@www.fortitudo.agency/projects", "http://www.fortitudo.agency/projects", "//evil.example", "/\\evil.example", "/administer", "/post-login", "/admin/../../evil", "/admin/%2e%2e/evil", "/admin/%2f%2fevil", "/admin/%5cevil", "/admin\n/evil"])("rejects external, encoded, unrelated or recursive destination %s", path => {
    expect(safeAuthDestination(path)).toBeNull();
    expect(postLoginUrl(path)).toBe("/post-login");
  });
});
