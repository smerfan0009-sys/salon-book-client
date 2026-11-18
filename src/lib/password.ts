// --------------------------------------------------
// PASSWORD POLICY (client-side mirror of server rule)
// --------------------------------------------------
// Server-side enforcement lives in salon-book-server/auth.js (hooks.before).
// This is a UX convenience only; the backend is authoritative.

export const PASSWORD_RULES =
  "At least 6 characters, one uppercase letter and one lowercase letter.";

export function passwordValidationError(password: string): string | null {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter and one lowercase letter.";
  }
  return null;
}
