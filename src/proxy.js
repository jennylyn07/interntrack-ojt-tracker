// File: src/proxy.js
// Purpose: Protect routes at the routing edge (Next.js 16 proxy convention).
//
// To prevent unnecessary database lookups on every single asset/page request,
// the proxy performs an optimistic check:
// - It inspects the request cookies to see if "better-auth.session_token" exists.
// - If the cookie is absent, it redirects dashboard views to /login, and
//   rejects API requests (except /api/auth/*) with a 401 Unauthorized status.
//
// IMPORTANT: Every endpoint still validates the session server-side for complete security.

import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("better-auth.session_token");

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
