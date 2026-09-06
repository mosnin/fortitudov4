import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  onConflictDoNothing: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: fake.auth, currentUser: fake.currentUser }));
vi.mock("@/db", () => ({ db: { select: fake.select, insert: fake.insert } }));

const { provisionSignedInUser } = await import("./provision-user");
const profile = {
  id: "user_verified",
  firstName: "Test",
  lastName: "Client",
  imageUrl: "https://example.com/avatar.png",
  primaryEmailAddressId: "email_primary",
  emailAddresses: [
    { id: "email_secondary", emailAddress: "secondary@example.com", verification: { status: "verified" } },
    { id: "email_primary", emailAddress: "client@example.com", verification: { status: "verified" } },
  ],
  publicMetadata: { role: "admin" },
  unsafeMetadata: { role: "admin" },
};
const client = { id: "db_client", clerkId: profile.id, role: "client" };

function rows(...results: unknown[][]) {
  for (const result of results) {
    fake.select.mockImplementationOnce(() => ({ from: () => ({ where: async () => result }) }));
  }
}

beforeEach(() => {
  vi.resetAllMocks();
  fake.auth.mockResolvedValue({ userId: profile.id });
  fake.currentUser.mockResolvedValue(profile);
  fake.insert.mockReturnValue({ values: fake.values });
  fake.values.mockReturnValue({ onConflictDoNothing: fake.onConflictDoNothing });
  fake.onConflictDoNothing.mockResolvedValue(undefined);
});

describe("verified sign-in provisioning", () => {
  it("never queries or writes for an anonymous request", async () => {
    fake.auth.mockResolvedValue({ userId: null });
    await expect(provisionSignedInUser()).rejects.toThrow("Sign in");
    expect(fake.select).not.toHaveBeenCalled();
    expect(fake.insert).not.toHaveBeenCalled();
  });

  it.each(["client", "admin", "project_manager", "va", "partner"])(
    "preserves an existing %s without fetching a profile or writing",
    async (role) => {
      rows([{ ...client, role }]);
      await expect(provisionSignedInUser()).resolves.toMatchObject({ role });
      expect(fake.currentUser).not.toHaveBeenCalled();
      expect(fake.insert).not.toHaveBeenCalled();
    }
  );

  it("provisions only the verified session identity and primary email, always as client", async () => {
    rows([], [client]);
    await expect(provisionSignedInUser()).resolves.toEqual(client);
    expect(fake.values).toHaveBeenCalledWith({
      clerkId: profile.id, email: "client@example.com", firstName: "Test",
      lastName: "Client", imageUrl: profile.imageUrl, role: "client",
    });
    expect(fake.onConflictDoNothing).toHaveBeenCalledOnce();
  });

  it.each([null, { ...profile, id: "different_user" }])("refuses a missing or mismatched provider identity", async (value) => {
    rows([]);
    fake.currentUser.mockResolvedValue(value);
    await expect(provisionSignedInUser()).rejects.toThrow("could not be verified");
    expect(fake.insert).not.toHaveBeenCalled();
  });

  it("does not substitute a secondary email when the primary is unverified", async () => {
    rows([]);
    fake.currentUser.mockResolvedValue({ ...profile, primaryEmailAddressId: "missing" });
    await expect(provisionSignedInUser()).rejects.toThrow("Verify your primary email");
    expect(fake.insert).not.toHaveBeenCalled();
  });

  it("refuses an unverified primary email", async () => {
    rows([]);
    fake.currentUser.mockResolvedValue({ ...profile, emailAddresses: [
      { id: "email_primary", emailAddress: "client@example.com", verification: { status: "unverified" } },
    ] });
    await expect(provisionSignedInUser()).rejects.toThrow("Verify your primary email");
    expect(fake.insert).not.toHaveBeenCalled();
  });

  it("reads the winning row after a race without downgrading a staff role", async () => {
    rows([], [{ ...client, role: "project_manager" }]);
    await expect(provisionSignedInUser()).resolves.toMatchObject({ role: "project_manager" });
    expect(fake.onConflictDoNothing).toHaveBeenCalledOnce();
  });

  it("fails rather than pretending provisioning succeeded", async () => {
    rows([], []);
    await expect(provisionSignedInUser()).rejects.toThrow("could not be opened");
  });

  it("propagates storage failure and never returns a synthetic user", async () => {
    rows([]);
    fake.onConflictDoNothing.mockRejectedValue(new Error("database unavailable"));
    await expect(provisionSignedInUser()).rejects.toThrow("database unavailable");
  });
});
