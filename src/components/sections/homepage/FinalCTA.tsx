"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Lock, ShieldCheck } from "lucide-react";

const ASSURANCES = [
  { icon: ShieldCheck, label: "Verified specialists" },
  { icon: CalendarCheck, label: "Flexible time slots" },
  { icon: Lock, label: "Secure online payment" },
];

const BG_IMAGE_URL =
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1920&q=80";

export default function FinalCTA() {
  return (
    <section
      id="book-now"
      className="w-full py-12 transition-colors duration-500 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-zinc-950 px-6 py-14 text-center text-white shadow-2xl shadow-amber-950/20 sm:px-12 md:py-20 dark:border-amber-400/25">
          {/* Background image */}
          <img
            src={BG_IMAGE_URL}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
            referrerPolicy="no-referrer"
          />

          {/* Overlay and gold glows */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/80 to-zinc-950/95" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-yellow-500/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
              Ready for your next{" "}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                salon day?
              </span>
            </h2>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Choose a service, pick a time that suits you, and we will take
              care of the rest.
            </p>

            <div className="flex justify-center pt-2">
              <Link
                href="/services"
                className="group relative inline-flex h-12 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-8 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 motion-reduce:transition-none"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full motion-reduce:hidden" />
                <span>Book Your Appointment</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-amber-400/15 pt-6">
              {ASSURANCES.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="flex items-center gap-2 text-xs font-medium text-zinc-300"
                  >
                    <Icon className="h-4 w-4 text-amber-400" />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
