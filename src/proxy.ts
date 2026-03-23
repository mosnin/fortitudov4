import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/services(.*)",
  "/pricing(.*)",
  "/portfolio(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/faq(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const handler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as Record<string, string> | undefined;
    if (metadata?.role !== "admin") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});

// Next.js 16 uses "proxy" instead of "middleware"
export const proxy = handler;
export default handler;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
