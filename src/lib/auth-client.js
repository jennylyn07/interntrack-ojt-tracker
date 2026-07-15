// File: src/lib/auth-client.js
// Purpose: Client-side Better Auth hooks for use in "use client" components.
//
// This creates the client-side auth helper that communicates with our
// /api/auth/[...all] endpoint. It provides:
// - authClient.signIn.email()   — sign in with email/password
// - authClient.signUp.email()   — register a new account
// - authClient.signOut()        — log out
// - authClient.useSession()     — React hook to read session state

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
