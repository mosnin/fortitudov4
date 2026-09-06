import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
const fake = vi.hoisted(() => ({ update: vi.fn(), set: vi.fn(), where: vi.fn(), returning: vi.fn() }));
vi.mock("@/db", () => ({ db: { update: fake.update } }));
import { claimStaffInvitation } from "./claim-staff-invitation";

beforeEach(() => {
  vi.resetAllMocks();
  fake.update.mockReturnValue({ set: fake.set });
  fake.set.mockReturnValue({ where: fake.where });
  fake.where.mockReturnValue({ returning: fake.returning });
});

describe("authorized invitation claim", () => {
  it("can update only the exact unclaimed staff placeholder, never an email-matched linked account", async () => {
    const row = { id: "original_uuid", role: "admin", clerkId: "user_verified" };
    fake.returning.mockResolvedValue([row]);
    await expect(claimStaffInvitation("user_verified", " Person@Example.com ")).resolves.toBe(row);
    expect(fake.set).toHaveBeenCalledWith({ clerkId: "user_verified", updatedAt: expect.any(Date) });
    const query = new PgDialect().sqlToQuery(fake.where.mock.calls[0][0]);
    expect(query.sql).toContain('"users"."clerk_id" = $1');
    expect(query.sql).toContain('and "users"."email" = $2');
    expect(query.sql).toContain('and "users"."role" in');
    expect(query.params).toEqual(["invite:person@example.com", "person@example.com", "admin", "project_manager", "va"]);
  });
  it("returns no match after an invitation was already claimed", async () => {
    fake.returning.mockResolvedValue([]);
    await expect(claimStaffInvitation("user_verified", "person@example.com")).resolves.toBeUndefined();
  });
  it("does not bypass a storage or uniqueness failure", async () => {
    fake.returning.mockRejectedValue(new Error("conflict"));
    await expect(claimStaffInvitation("user_verified", "person@example.com")).rejects.toThrow("conflict");
  });
});
