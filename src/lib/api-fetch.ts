import { authClient } from "@/lib/auth-client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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

  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
}
