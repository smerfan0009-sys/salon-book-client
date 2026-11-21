"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Plus,
  ListChecks,
  Users,
  LayoutDashboard,
  Menu,
  Scissors,
  ShieldCheck,
  User,
} from "lucide-react";

import RoleGate from "@/components/auth/role-gate";
import DashboardSignOut from "@/components/auth/dashboard-sign-out";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type DashboardRole = "admin" | "customer";

const navigation = {
  admin: [
    { href: "/dashboard/admin/profile",
      label: "My Profile",
      icon: User,
     },
    {
      href: "/dashboard/admin",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/admin/appointments",
      label: "Manage Appointments",
      icon: ListChecks,
    },
    {
      href: "/dashboard/admin/transactions",
      label: "Transactions",
      icon: CreditCard,
    },
    {
      href: "/dashboard/admin/services",
      label: "Manage Services",
      icon: Scissors,
    },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/services/new", label: "Add Service", icon: Plus },
  ],
  customer: [
    {
      href: "/dashboard/customer/profile",
      label: "My Profile",
      icon: User,
    },
    {
      href: "/dashboard/customer",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/customer/appointments",
      label: "My Appointments",
      icon: CalendarDays,
    },
    {
      href: "/services",
      label: "Book Appointment",
      icon: CalendarDays,
    },
  ],
} as const;

function UserAvatar({
  image,
  name,
}: {
  image?: string | null;
  name?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = name?.trim().charAt(0).toUpperCase();

  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-500/50 bg-gradient-to-br from-amber-100 to-yellow-100 font-semibold text-amber-800 dark:border-amber-400/50 dark:from-amber-950/80 dark:to-yellow-950/60 dark:text-amber-300">
      {image && !imageFailed ? (
        // The image is user-provided and may be hosted outside the Next image allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name ? `${name}'s profile` : "Profile"}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initial || <User className="size-5" aria-hidden="true" />
      )}
    </div>
  );
}

function DashboardNavigation({
  role,
  onNavigate,
}: {
  role: DashboardRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={`${role} dashboard navigation`} className="space-y-1.5">
      {navigation[role].map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/services"
            ? pathname === item.href || pathname.startsWith("/services/")
            : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-amber-500/15 text-amber-800 shadow-sm dark:bg-amber-400/15 dark:text-amber-200"
                : "text-zinc-600 hover:bg-amber-500/10 hover:text-amber-800 dark:text-zinc-300 dark:hover:bg-amber-400/10 dark:hover:text-amber-200",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function DashboardSidebar({
  role,
  onNavigate,
}: {
  role: DashboardRole;
  onNavigate?: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const roleLabel = role === "admin" ? "Administrator" : "Customer";
  const RoleIcon = role === "admin" ? ShieldCheck : User;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/25 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500">
          <Scissors className="size-5 rotate-45" aria-hidden="true" />
        </div>
        <div>
          <p className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            SalonBook
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {roleLabel} portal
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <nav
            aria-label={`${role} dashboard navigation`}
            className="space-y-1.5"
          >
            {navigation[role].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </div>
              );
            })}
          </nav>
        }
      >
        <DashboardNavigation role={role} onNavigate={onNavigate} />
      </Suspense>

      <div className="mt-auto border-t border-amber-500/15 pt-4 dark:border-amber-400/15">
        <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
          <UserAvatar image={user?.image} name={user?.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {user?.name || "My Account"}
            </p>
            <p className="flex items-center gap-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
              <RoleIcon className="size-3 shrink-0" aria-hidden="true" />
              {roleLabel}
            </p>
          </div>
        </div>
        <DashboardSignOut />
      </div>
    </div>
  );
}

export default function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleGate role={role}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-6 sm:px-6 lg:gap-8 lg:px-8 lg:py-8">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 self-start rounded-2xl border border-amber-500/20 bg-white/70 p-4 shadow-lg shadow-amber-950/5 backdrop-blur-xl dark:border-amber-400/20 dark:bg-zinc-950/70 dark:shadow-black/30 lg:block">
          <DashboardSidebar role={role} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {role === "admin" ? "Admin portal" : "Customer portal"}
            </p>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                aria-label="Open dashboard navigation"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted hover:text-foreground"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] border-r-amber-500/20 bg-white/95 p-5 backdrop-blur-xl dark:border-r-amber-400/20 dark:bg-zinc-950/95"
              >
                <DashboardSidebar
                  role={role}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          {children}
        </div>
      </div>
    </RoleGate>
  );
}
