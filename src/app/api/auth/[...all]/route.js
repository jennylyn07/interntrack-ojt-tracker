// File: src/app/api/auth/[...all]/route.js
// Purpose: Catch-all route handler for Better Auth.
//
// This single file handles ALL auth-related HTTP requests:
//   POST /api/auth/sign-in/email
//   POST /api/auth/sign-up/email
//   POST /api/auth/sign-out
//   GET  /api/auth/get-session
//   ... and any other auth endpoints Better Auth exposes.
//
// We import our configured auth instance and convert it to Next.js
// route handlers using Better Auth's built-in helper.

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
