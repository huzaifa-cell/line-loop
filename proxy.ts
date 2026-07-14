import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Next.js v16 proxy.ts (renamed from middleware.ts).
 * Gates /account/* routes — redirects unauthenticated users to /sign-in.
 * Storefront, checkout, and track-order remain public (guest checkout is primary).
 */

const isProtectedRoute = createRouteMatcher(["/account(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  if (isAdminRoute(req)) {
    await auth.protect();
    const { sessionClaims } = await auth();
    // Assuming role is stored in publicMetadata
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin" && role !== "staff") {
      return Response.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
