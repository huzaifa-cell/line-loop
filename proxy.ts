import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Next.js v16 proxy.ts (renamed from middleware.ts).
 * Gates /account/* routes — redirects unauthenticated users to /sign-in.
 * Storefront, checkout, and track-order remain public (guest checkout is primary).
 */

const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
