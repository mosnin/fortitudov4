import { defineConfig } from "vitest/config";

/**
 * Tests cover the Helix invariants — the rules that must survive future
 * changes and that a type error alone would not catch.
 *
 * Deliberately node-environment and database-free: every test exercises pure
 * logic (the overlay, guard resolution, the sandbox document) or inspects the
 * registry. Anything needing Postgres belongs in an integration suite that
 * does not exist yet, and faking it with mocks would only test the mocks.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
