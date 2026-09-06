const DESTINATIONS = [
  "/dashboard", "/admin", "/partner", "/onboarding", "/checkout", "/projects",
  "/messages", "/payments", "/settings", "/notifications", "/reports",
] as const;

/** Keep saved internal destinations, but never let them skip account setup. */
export function safeAuthDestination(value?: string): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return null;
  try {
    const url = new URL(value, "https://fortitudo.agency");
    if (url.origin !== "https://fortitudo.agency") return null;
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
