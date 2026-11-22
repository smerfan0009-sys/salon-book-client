import { authClient } from "@/lib/auth-client";

// Browser API requests stay on the Next.js origin and are forwarded by the
// /api rewrite, so Better Auth cookies remain same-origin.
export function apiRequest(path: string, init: RequestInit = {}) {
  return fetch(path, {
    ...init,
    credentials: init.credentials ?? "include",
  });
}

// --------------------------------------------------
// AUTHENTICATED FETCH FOR EXPRESS REST APIS
// --------------------------------------------------
// Fetches a fresh short-lived JWT from Better Auth (GET /api/auth/token,
// session cookie required) and attaches it as an Authorization Bearer
// header. The Express backend cryptographically verifies the token
// (JWKS) and re-checks the user's role and blocked status in MongoDB.

export async function apiFetch(path: string, init: RequestInit = {}) {
  const { data } = await authClient.token();
  const token = data?.token;

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return apiRequest(path, {
    ...init,
    headers,
  });
}
