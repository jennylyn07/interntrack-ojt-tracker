// File: src/proxy.js
// Purpose: Protect routes at the routing edge (Next.js 16 proxy convention).
//
// To prevent unnecessary database lookups on every single asset/page request,
// the proxy performs an optimistic check:
// - It inspects the request cookies to see if a Better Auth session token exists.
// - Better Auth uses the plain cookie name ("better-auth.session_token") over HTTP
//   (local dev) and the __Secure- prefixed name ("__Secure-better-auth.session_token")
//   over HTTPS (production). Both are checked.
// - If no session cookie is found, it redirects dashboard views to /login, and
//   rejects API requests (except /api/auth/*) with a 401 Unauthorized status.
//
// IMPORTANT: Every endpoint still validates the session server-side for complete security.

import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Better Auth uses the __Secure- cookie prefix automatically when the app
  // runs over HTTPS (production). Locally over HTTP it uses the plain name.
  // We must check both so the proxy works in all environments.
  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token");

  // Protect all dashboard views
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all backend API endpoints except for auth routes
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
