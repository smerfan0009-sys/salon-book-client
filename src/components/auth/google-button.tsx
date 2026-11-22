"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

// --------------------------------------------------
// GOOGLE AUTH BUTTON (sign in / sign up)
// --------------------------------------------------
// Redirect-based OAuth via Better Auth. After Google completes the flow,
// the user lands on /dashboard which routes by role.

export default function GoogleButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: `${window.location.origin}/dashboard`,
          errorCallbackURL: `${window.location.origin}/sign-in`,
        },
        {
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error?.message ?? "Google sign-in failed. Please try again.");
          },
        }
      );
      // Browser navigates away to Google on success.
    } catch {
      setLoading(false);
      toast.error("Google sign-in is not configured yet. Please try email and password.");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full gap-2"
      onClick={handleClick}
      disabled={loading}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.9 6.9 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      {loading ? "Redirecting to Google..." : label}
    </Button>
  );
}
