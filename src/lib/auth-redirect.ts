const DESTINATIONS = [
  "/dashboard", "/admin", "/partner", "/onboarding", "/checkout", "/projects",
  "/messages", "/payments", "/settings", "/notifications", "/reports",
] as const;

/** Keep saved internal destinations, but never let them skip account setup. */
export function safeAuthDestination(value?: string): string | null {
  if (!value || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return null;
  if (!value.startsWith("/") && !value.startsWith("https://")) return null;
  try {
    const url = new URL(value, "https://fortitudo.agency");
    // Clerk's middleware supplies absolute return URLs. Normalize only our
    // canonical origins into an internal path; never preserve an external URL.
    if (!["https://fortitudo.agency", "https://www.fortitudo.agency"].includes(url.origin) || url.username || url.password) return null;
    if (!DESTINATIONS.some(path => url.pathname === path || url.pathname.startsWith(`${path}/`))) return null;
    if (/%(?:2f|5c|2e)/i.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function postLoginUrl(value?: string): string {
  const destination = safeAuthDestination(value);
  return destination ? `/post-login?redirect_url=${encodeURIComponent(destination)}` : "/post-login";
}
