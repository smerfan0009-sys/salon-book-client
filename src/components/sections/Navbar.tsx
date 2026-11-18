"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Scissors,
  Menu,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  User,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ThemeToggle from "@/components/theme-toggle";
import { useSession, authClient } from "@/lib/auth-client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  // Better Auth session (cookie-based; shared with the Express API).
  const { data: session } = useSession();

  const userRole =
    (session?.user as { role?: string } | undefined)?.role ?? "customer";

  const dashboardPath =
    userRole === "admin" ? "/dashboard/admin" : "/dashboard/customer";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Services", href: "/services" },
  ];

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } finally {
      setIsOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            <Scissors className="h-5 w-5 rotate-45" />
          </div>

          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xl font-bold tracking-tight text-foreground">
              Salon<span className="text-primary">Book</span>
              <Sparkles className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            </span>

            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Appointment Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Theme Toggle */}
          <ThemeToggle />

          {session ? (
            /* Authenticated Profile Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-muted">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-semibold text-primary">
                  {session.user.name?.charAt(0)?.toUpperCase() || (
                    <User className="h-4 w-4" />
                  )}
                </div>

                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                  {session.user.name || "My Account"}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-2">
                {/* User Name */}
                <div className="px-2 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {session.user.name || "My Account"}
                  </p>

                  {session.user.email && (
                    <p className="truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                </div>

                <DropdownMenuSeparator />

                {/* Dashboard */}
                <DropdownMenuItem
                  onClick={() => router.push(dashboardPath)}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Public Authentication Actions */
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogIn className="mr-1.5 h-4 w-4" />
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Theme Toggle */}
          <ThemeToggle />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="flex w-[300px] flex-col justify-between p-6 sm:w-[350px]"
            >
              <div className="flex flex-col gap-6">
                {/* Mobile Logo */}
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Scissors className="h-4 w-4 rotate-45" />
                  </div>

                  <span className="text-lg font-bold tracking-tight text-foreground">
                    Salon<span className="text-primary">Book</span>
                  </span>
                </Link>

                <hr className="border-muted" />

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-3">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname === link.href ||
                          pathname.startsWith(`${link.href}/`);

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Authenticated User */}
                {session && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {session.user.name?.charAt(0)?.toUpperCase() || (
                          <User className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {session.user.name || "My Account"}
                        </span>

                        <span className="truncate text-xs text-muted-foreground">
                          {session.user.email}
                        </span>
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        router.push(dashboardPath);
                      }}
                      className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Authentication Actions */}
              <div className="flex flex-col gap-3 border-t pt-4">
                {session ? (
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/sign-in"
                      onClick={closeMobileMenu}
                      className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>

                    <Link
                      href="/sign-up"
                      onClick={closeMobileMenu}
                      className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
