"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";

// --------------------------------------------------
// /dashboard -> role-based redirect
// --------------------------------------------------
// Admins go to /dashboard/admin, everyone else to /dashboard/customer.
// Unauthenticated visitors are sent to /sign-in.
// This is a convenience redirect — API routes enforce authorization.

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const role = (session.user as { role?: string }).role ?? "customer";
    router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
  }, [isPending, session?.user, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );
}
