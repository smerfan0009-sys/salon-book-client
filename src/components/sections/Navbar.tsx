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

// Temporary session type.
// Replace with Better Auth session type after configuring authentication.
type Session = {
  user: {
    name?: string;
    email?: string;
    role?: string;
  };
} | null;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Temporary mock auth state
  const session: Session = null;
  const userRole = session?.user?.role || "customer";

  const dashboardPath =
    userRole === "admin" ? "/dashboard/admin" : "/dashboard/customer";

  const handleSignOut = async () => {
    // await authClient.signOut();
    router.push("/sign-in");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Services", href: "/services" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
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
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {session && (
            <Link
              href={dashboardPath}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/dashboard")
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-muted">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-semibold text-primary">
                  {session.user.name?.charAt(0) || <User className="h-4 w-4" />}
                </div>

                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                  {session.user.name || "My Account"}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Signed in as{" "}
                  <span className="text-foreground">{session.user.email}</span>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => router.push(dashboardPath)}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push(`${dashboardPath}/profile`)}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

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

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden">
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
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Scissors className="h-4 w-4 rotate-45" />
                  </div>

                  <span className="text-lg font-bold tracking-tight">
                    Salon<span className="text-primary">Book</span>
                  </span>
                </Link>

                <hr className="border-muted" />

                {/* Mobile Links */}
                <nav className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {session && (
                    <Link
                      href={dashboardPath}
                      onClick={() => setIsOpen(false)}
                      className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${
                        pathname.startsWith("/dashboard")
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                </nav>
              </div>

              {/* Mobile Auth Actions */}
              <div className="flex flex-col gap-3 border-t pt-4">
                {session ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-2 py-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {session.user.name?.charAt(0) || "U"}
                      </div>

                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-semibold">
                          {session.user.name}
                        </span>

                        <span className="truncate text-xs text-muted-foreground">
                          {session.user.email}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                      className="w-full justify-start gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/sign-in"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>

                    <Link
                      href="/sign-up"
                      onClick={() => setIsOpen(false)}
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
