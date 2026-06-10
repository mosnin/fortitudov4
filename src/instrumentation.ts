export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures server-side errors in App Router (no-op if Sentry isn't initialized).
export { captureRequestError as onRequestError } from "@sentry/nextjs";
