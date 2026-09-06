import { beforeEach, describe, expect, it, vi } from "vitest";
const fake = vi.hoisted(() => ({ auth: vi.fn(), rows: vi.fn(), provision: vi.fn(), redirect: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: fake.auth }));
vi.mock("@/db", () => ({ db: { select: () => ({ from: () => ({ where: fake.rows }) }) } }));
vi.mock("@/lib/provision-user", () => ({ provisionSignedInUser: fake.provision }));
vi.mock("next/navigation", () => ({ redirect: fake.redirect }));
import PostLoginPage from "./page";

beforeEach(() => {
  vi.resetAllMocks();
  fake.auth.mockResolvedValue({ userId: "user_verified" });
  fake.redirect.mockImplementation((path: string) => { throw new Error(`redirect:${path}`); });
});
const props = (redirect_url?: string) => ({ searchParams: Promise.resolve({ redirect_url }) });

describe("verified account handoff", () => {
  it("requires a real session", async () => {
    fake.auth.mockResolvedValue({ userId: null });
    await expect(PostLoginPage(props())).rejects.toThrow("redirect:/sign-in");
    expect(fake.rows).not.toHaveBeenCalled();
  });
  it("provisions a missing client before onboarding, even from a saved project link", async () => {
    fake.rows.mockResolvedValue([]);
    fake.provision.mockResolvedValue({ role: "client" });
    await expect(PostLoginPage(props("/projects/abc"))).rejects.toThrow("redirect:/onboarding");
    expect(fake.provision).toHaveBeenCalledOnce();
  });
  it("keeps a saved destination for an already provisioned user", async () => {
    fake.rows.mockResolvedValue([{ role: "client" }]);
    await expect(PostLoginPage(props("/projects/abc"))).rejects.toThrow("redirect:/projects/abc");
    expect(fake.provision).not.toHaveBeenCalled();
  });
  it.each([["admin", "/admin"], ["project_manager", "/admin"], ["va", "/admin"], ["partner", "/partner"], ["client", "/dashboard"]])("routes %s to %s", async (role, path) => {
    fake.rows.mockResolvedValue([{ role }]);
    await expect(PostLoginPage(props())).rejects.toThrow(`redirect:${path}`);
  });
  it("routes a claimed staff invitation to staff, not client onboarding", async () => {
    fake.rows.mockResolvedValue([]);
    fake.provision.mockResolvedValue({ role: "admin" });
    await expect(PostLoginPage(props())).rejects.toThrow("redirect:/admin");
  });
  it("never redirects to the requested project after failed provisioning", async () => {
    fake.rows.mockResolvedValue([]);
    fake.provision.mockRejectedValue(new Error("storage unavailable"));
    await expect(PostLoginPage(props("/projects/abc"))).rejects.toThrow("storage unavailable");
    expect(fake.redirect).not.toHaveBeenCalled();
  });
});
