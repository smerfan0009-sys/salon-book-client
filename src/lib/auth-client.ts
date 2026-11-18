import { createAuthClient } from "better-auth/react";
import { jwtClient, adminClient } from "better-auth/client/plugins";

// --------------------------------------------------
// BETTER AUTH CLIENT (browser)
// --------------------------------------------------
// Talks to the Express-mounted Better Auth instance at
// ${NEXT_PUBLIC_API_URL}/api/auth. Session cookies are sent
// automatically (credentials: "include" is the client default).
//
// jwtClient()  -> typed access to /token (issues the Bearer JWT used
//                 for protected Express REST APIs) and the JWKS endpoint.
// adminClient() -> typed access to role / blocked-user fields.
//
// No secrets are used here; everything is public client configuration.

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  plugins: [jwtClient(), adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
