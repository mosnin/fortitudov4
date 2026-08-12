/**
 * The admin-only page guard.
 *
 * AGENTS.md: finance pages require `admin`. Two layouts — the agency P&L group
 * and team roles — are the only thing standing between a project manager or a
 * client and the agency's money, and they stand on this one function. A guard
 * that stops redirecting does not error; the page simply renders.
 *
 * `redirect()` is mocked to throw, which is what Next's real implementation
 * does — the guard depends on that to stop execution, so a mock that merely
 * recorded the call would let the "no user row" branch fall through and give a
 * false pass.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/db/schema";

const fake = vi.hoisted(() => ({
  clerkId: null as string | null,
  user: null as { role: string } | null,
}));

class RedirectSignal extends Error {
  constructor(readonly destination: string) {
    super(`NEXT_REDIRECT:${destination}`);
  }
}

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: fake.clerkId }),
}));

vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new RedirectSignal(destination);
  },
}));

vi.mock("@/db", () => ({
  db: {
    query: { users: { findFirst: async () => fake.user ?? undefined } },
  },
}));

const { assertAdminPage } = await import("./admin-page-guard");

/** The destination the guard redirected to, or null if it let the page render. */
async function destinationFor(role: string | null, signedIn = true): Promise<string | null> {
  fake.clerkId = signedIn ? "clerk_1" : null;
  fake.user = role === null ? null : { role };
  try {
    await assertAdminPage();
    return null;
  } catch (thrown) {
    expect(thrown).toBeInstanceOf(RedirectSignal);
    return (thrown as RedirectSignal).destination;
  }
}

beforeEach(() => {
  fake.clerkId = null;
  fake.user = null;
});

describe("assertAdminPage", () => {
  it("lets an admin through", async () => {
    await expect(destinationFor("admin")).resolves.toBeNull();
  });

  it.each<UserRole>(["project_manager", "va"])(
    "bounces %s off to the admin overview",
    async (role) => {
      await expect(destinationFor(role)).resolves.toBe("/admin");
    }
  );

  it("bounces a client", async () => {
    // The (admin) layout above this one sends them to /dashboard; this guard's
    // job is only to refuse, and it must refuse before that runs too.
    await expect(destinationFor("client")).resolves.toBe("/admin");
  });

  it("sends an anonymous visitor to sign in, not to the page", async () => {
    await expect(destinationFor(null, false)).resolves.toBe("/sign-in");
  });

  it("refuses a signed-in user with no database row", async () => {
    // The role is unknown at this point, so unknown must mean no.
    await expect(destinationFor(null)).resolves.toBe("/admin");
  });

  it.each(["", " ", "Admin", "ADMIN", "admin ", "superadmin", "owner", "__proto__"])(
    "refuses the near-miss role %o",
    async (role) => {
      await expect(destinationFor(role)).resolves.toBe("/admin");
    }
  );
});
