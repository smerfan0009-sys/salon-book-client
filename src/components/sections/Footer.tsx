import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Clock, Crown, Mail, MapPin, Phone } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Brand icons (lucide-react no longer ships brand logos)              */
/* ------------------------------------------------------------------ */

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Edit these values to match your real salon details                  */
/* ------------------------------------------------------------------ */

const SALON_INFO = {
  name: "SalonBook",
  description:
    "Book hair, skin, makeup, and spa treatments with verified specialists. Pick a service, choose your time, and confirm in minutes.",
  email: "smerfan0009@gmail.com",
  address: ["Rampura, Banasreee", "Dhaka, Bangladesh"],
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "My Appointments", href: "/my-appointments" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

const OPENING_HOURS = [
  { days: "Monday - Friday", time: "10:00 AM - 8:00 PM" },
  { days: "Saturday", time: "10:00 AM - 9:00 PM" },
  { days: "Sunday", time: "Closed" },
];

interface SocialLink {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// Replace with your own profile URLs.
const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/smerfan0009-sys", icon: GithubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/smerfan143/", icon: LinkedinIcon },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const headingClass =
  "text-sm font-semibold text-white after:mt-2 after:block after:h-0.5 after:w-8 after:rounded-full after:bg-gradient-to-r after:from-amber-400 after:to-yellow-500";

const linkClass =
  "text-sm text-zinc-400 transition-colors duration-300 hover:text-amber-300 focus-visible:outline-none focus-visible:text-amber-300 focus-visible:underline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden border-t border-amber-500/25 bg-zinc-950 text-white">
      {/* Ambient gold glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Logo, description, social links */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label={`${SALON_INFO.name} home`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/20">
                <Crown className="h-5 w-5" />
              </span>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                {SALON_INFO.name}
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
              {SALON_INFO.description}
            </p>

            <ul className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${SALON_INFO.name} on ${social.label}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-white/5 text-amber-200/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation" className="lg:col-span-2">
            <h3 className={headingClass}>Quick Links</h3>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact and address */}
          <div className="lg:col-span-3">
            <h3 className={headingClass}>Contact &amp; Address</h3>
            <ul className="mt-5 space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <address className="not-italic leading-relaxed">
                  {SALON_INFO.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                <a href={`mailto:${SALON_INFO.email}`} className={linkClass}>
                  {SALON_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Opening hours */}
          <div className="lg:col-span-3">
            <h3 className={headingClass}>Opening Hours</h3>
            <ul className="mt-5 space-y-3">
              {OPENING_HOURS.map((slot) => (
                <li
                  key={slot.days}
                  className="flex items-start gap-3 text-sm"
                >
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-medium text-zinc-200">{slot.days}</p>
                    <p
                      className={
                        slot.time === "Closed"
                          ? "text-zinc-500"
                          : "text-zinc-400"
                      }
                    >
                      {slot.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-amber-400/15 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-zinc-500">
            &copy; {currentYear} {SALON_INFO.name}. All rights reserved.
          </p>

          <ul className="flex items-center gap-5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-xs text-zinc-500 transition-colors duration-300 hover:text-amber-300 focus-visible:outline-none focus-visible:text-amber-300 focus-visible:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
