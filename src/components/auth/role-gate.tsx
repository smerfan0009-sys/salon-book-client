"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";

// --------------------------------------------------
// CLIENT-SIDE ROLE GUARD (defense-in-depth)
// --------------------------------------------------
// Redirects unauthenticated users to /sign-in and users with the wrong
// role to their own dashboard. The real authorization boundary is the
// Express API (requireAuth / requireAdmin); this only shapes the UI.

export default function RoleGate({
  role,
  children,
}: {
  role: "admin" | "customer";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const currentRole = (session?.user as { role?: string } | undefined)?.role ?? "customer";
  const allowed = Boolean(session?.user) && currentRole === role;

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    if (currentRole !== role) {
      router.replace(
        currentRole === "admin" ? "/dashboard/admin" : "/dashboard/customer"
      );
    }
  }, [isPending, session?.user, currentRole, role, router]);

  return (
    <>
      {children}
      {(isPending || !allowed) && (
        <div className="fixed inset-0 z-50 flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Checking your access...</p>
          </div>
        </div>
      )}
    </>
  );
}
