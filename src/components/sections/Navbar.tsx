"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

type NavLink =
  | { type: "route"; name: string; href: string }
  | { type: "section"; name: string; sectionId: string };

// Notun section add korte chaile ekhane ekta line add koro,
// ar home page er oi section e matching id dao.
const NAV_LINKS: NavLink[] = [
  { type: "route", name: "Home", href: "/" },
  {
    type: "section",
    name: "Featured Services",
    sectionId: "featured-services",
  },
  { type: "section", name: "Categories", sectionId: "categories" },
  { type: "section", name: "How It Works", sectionId: "how-it-works" },
  { type: "section", name: "FAQ", sectionId: "faq" },
  { type: "route", name: "Browse Services", href: "/services" },
];

const SECTION_IDS = NAV_LINKS.flatMap((l) =>
  l.type === "section" ? [l.sectionId] : [],
);

// Sticky navbar er height (top-3 + h-16) er por jate section heading dekha jay.
const ACTIVE_OFFSET = 140;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { data: session, isPending } = useSession();
  const profileImage = session?.user?.image;

  const userRole =
    (session?.user as { role?: string } | undefined)?.role ?? "customer";
  const isAdmin = userRole === "admin";

  const dashboardPath = isAdmin ? "/dashboard/admin" : "/dashboard/customer";
  // Tomar real profile route onujayi eta change koro.
  const profilePath = isAdmin
    ? "/dashboard/admin/profile"
    : "/dashboard/customer/profile";

  useEffect(() => {
    if (pathname !== "/") return;

    const onScroll = () => {
      let current: string | null = null;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    // Shurute ekbar check (callback er bhitore, tai synchronous setState na).
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const currentSection = pathname === "/" ? activeSection : null;

  const isLinkActive = (link: NavLink) => {
    if (link.type === "section") {
      return pathname === "/" && currentSection === link.sectionId;
    }
    if (link.href === "/") {
      return pathname === "/" && currentSection === null;
    }
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  };

  const getHref = (link: NavLink) =>
    link.type === "section" ? `/#${link.sectionId}` : link.href;

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: NavLink,
  ) => {
    const wasOpen = isOpen;
    setIsOpen(false);
    const isHome = pathname === "/";
    // Mobile menu bondho hobar animation shesh howar por scroll korbo.
    const delay = wasOpen ? 300 : 0;

    if (link.type === "section" && isHome) {
      e.preventDefault();
      setTimeout(() => {
        document
          .getElementById(link.sectionId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `/#${link.sectionId}`);
      }, delay);
    } else if (link.type === "route" && link.href === "/" && isHome) {
      e.preventDefault();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
      }, delay);
    }
    // Onno page theke ashle default Link navigation (/#id) kaj korbe.
  };

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

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  const renderFallbackContent = () =>
    session?.user?.name?.charAt(0)?.toUpperCase() || (
      <User className="h-4 w-4" />
    );

  const roleBadge = (
    <span className="mt-1.5 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
      {isAdmin ? "Admin" : "Customer"}
    </span>
  );

  return (
    <header className="sticky top-3 z-50 w-full px-4 transition-all duration-500 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-amber-500/25 bg-white/65 px-4 shadow-lg shadow-amber-950/5 backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40 hover:shadow-amber-500/10 md:px-6 dark:border-amber-400/20 dark:bg-zinc-950/65 dark:shadow-black/40 dark:hover:border-amber-400/35">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/25 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 group-hover:shadow-amber-500/40 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500">
            <Scissors className="h-5 w-5 rotate-45 stroke-[2.2] transition-transform duration-300 group-hover:rotate-12" />
          </div>

          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Salon
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400">
                Book
              </span>
              <Sparkles className="h-3.5 w-3.5 animate-pulse fill-amber-500 text-amber-600 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 dark:fill-amber-400 dark:text-amber-300" />
            </span>

            <span className="text-[10px] font-medium uppercase tracking-widest text-amber-800/75 dark:text-amber-300/70">
              Appointment Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 md:flex lg:gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = isLinkActive(link);

            return (
              <Link
                key={link.name}
                href={getHref(link)}
                onClick={(e) => handleNavClick(e, link)}
                className={`group relative whitespace-nowrap py-1 text-sm font-medium transition-colors duration-300 hover:text-amber-600 dark:hover:text-amber-400 ${
                  isActive
                    ? "font-semibold text-amber-600 dark:text-amber-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 ease-out ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {isPending ? (
            <div className="h-9 w-28 animate-pulse rounded-xl bg-amber-500/10 dark:bg-amber-400/10" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border border-transparent px-2 py-1.5 transition-all duration-300 hover:border-amber-500/25 hover:bg-amber-500/10 dark:hover:border-amber-400/25 dark:hover:bg-amber-400/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-500/50 bg-gradient-to-br from-amber-100 to-yellow-100 font-semibold text-amber-800 transition-transform duration-300 group-hover:scale-105 dark:border-amber-400/50 dark:from-amber-950/80 dark:to-yellow-950/60 dark:text-amber-300">
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={profileImage}
                      src={profileImage}
                      alt={session.user.name || "Profile"}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={handleAvatarError}
                    />
                  ) : null}
                  <span
                    style={{ display: profileImage ? "none" : "flex" }}
                    className="h-full w-full items-center justify-center"
                  >
                    {renderFallbackContent()}
                  </span>
                </div>

                <span className="max-w-[120px] truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {session.user.name || "My Account"}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="mt-2 w-60 rounded-xl border-amber-500/20 bg-white/90 p-2 backdrop-blur-xl dark:border-amber-400/20 dark:bg-zinc-950/90"
              >
                <div className="px-2 py-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {session.user.name || "My Account"}
                  </p>

                  {session.user.email && (
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {session.user.email}
                    </p>
                  )}

                  {roleBadge}
                </div>

                <DropdownMenuSeparator className="bg-amber-500/15 dark:bg-amber-400/15" />

                <DropdownMenuItem
                  onClick={() => router.push(profilePath)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg transition-colors focus:bg-amber-500/10 focus:text-amber-700 dark:focus:bg-amber-400/10 dark:focus:text-amber-300"
                >
                  <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  My Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push(dashboardPath)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg transition-colors focus:bg-amber-500/10 focus:text-amber-700 dark:focus:bg-amber-400/10 dark:focus:text-amber-300"
                >
                  <LayoutDashboard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-amber-500/15 dark:bg-amber-400/15" />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex cursor-pointer items-center gap-2 rounded-lg text-red-600 transition-colors focus:bg-red-500/10 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/15 dark:focus:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/sign-in"
                className="group inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-700 transition-all duration-300 hover:bg-amber-500/10 hover:text-amber-700 active:scale-95 dark:text-zinc-300 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
              >
                <LogIn className="mr-1.5 h-4 w-4 text-amber-600 transition-transform duration-300 group-hover:-translate-x-0.5 dark:text-amber-400" />
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-4 text-sm font-semibold text-zinc-950 shadow-sm shadow-amber-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-md hover:shadow-amber-500/35 active:scale-95 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                <UserPlus className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-white/70 text-amber-700 shadow-sm transition-all duration-300 hover:bg-amber-500/15 active:scale-95 dark:border-amber-400/25 dark:bg-zinc-900/70 dark:text-amber-300 dark:hover:bg-amber-400/15">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="flex w-[300px] flex-col justify-between border-l-amber-500/20 bg-white/85 p-6 backdrop-blur-xl sm:w-[350px] dark:border-l-amber-400/20 dark:bg-zinc-950/85"
            >
              <div className="flex flex-col gap-6">
                {/* Mobile Logo */}
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="group flex items-center gap-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 shadow-sm transition-transform duration-300 group-hover:rotate-6 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500">
                    <Scissors className="h-4 w-4 rotate-45 stroke-[2.2]" />
                  </div>

                  <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Salon
                    <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400">
                      Book
                    </span>
                  </span>
                </Link>

                <hr className="border-amber-500/20 dark:border-amber-400/20" />

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-2">
                  {NAV_LINKS.map((link) => {
                    const isActive = isLinkActive(link);

                    return (
                      <Link
                        key={link.name}
                        href={getHref(link)}
                        onClick={(e) => handleNavClick(e, link)}
                        className={`rounded-xl px-3.5 py-2.5 text-base font-medium transition-all duration-300 hover:translate-x-1 ${
                          isActive
                            ? "bg-amber-500/15 font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                            : "text-zinc-700 hover:bg-amber-500/10 dark:text-zinc-300 dark:hover:bg-amber-400/10"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Authenticated User */}
                {session && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 backdrop-blur-md dark:border-amber-400/20 dark:bg-amber-400/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-500/40 bg-gradient-to-br from-amber-100 to-yellow-100 font-bold text-amber-800 dark:border-amber-400/40 dark:from-amber-950/80 dark:to-yellow-950/60 dark:text-amber-300">
                        {profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={profileImage}
                            src={profileImage}
                            alt={session.user.name || "Profile"}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={handleAvatarError}
                          />
                        ) : null}
                        <span
                          style={{ display: profileImage ? "none" : "flex" }}
                          className="h-full w-full items-center justify-center"
                        >
                          {renderFallbackContent()}
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-col items-start">
                        <span className="w-full truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {session.user.name || "My Account"}
                        </span>

                        <span className="w-full truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {session.user.email}
                        </span>

                        {roleBadge}
                      </div>
                    </div>

                    <hr className="my-2 border-amber-500/15 dark:border-amber-400/15" />

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        router.push(profilePath);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-zinc-800 transition-all duration-300 hover:translate-x-1 hover:bg-amber-500/10 hover:text-amber-700 dark:text-zinc-200 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
                    >
                      <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        router.push(dashboardPath);
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-zinc-800 transition-all duration-300 hover:translate-x-1 hover:bg-amber-500/10 hover:text-amber-700 dark:text-zinc-200 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
                    >
                      <LayoutDashboard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Dashboard
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Authentication Actions */}
              <div className="flex flex-col gap-3 border-t border-amber-500/20 pt-4 dark:border-amber-400/20">
                {isPending ? null : session ? (
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-2 rounded-xl bg-red-600 transition-transform active:scale-95 hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/sign-in"
                      onClick={closeMobileMenu}
                      className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-amber-500/35 bg-white/70 text-sm font-medium text-amber-800 transition-all duration-300 hover:bg-amber-500/10 active:scale-95 dark:border-amber-400/35 dark:bg-zinc-900/70 dark:text-amber-300 dark:hover:bg-amber-400/10"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>

                    <Link
                      href="/sign-up"
                      onClick={closeMobileMenu}
                      className="group relative inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-sm font-semibold text-zinc-950 shadow-sm shadow-amber-500/25 transition-all duration-300 active:scale-95 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
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
