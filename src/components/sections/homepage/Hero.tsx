"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Crown,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80";

const QUICK_CATEGORIES = [
  "Haircut & Styling",
  "Facial & Skincare",
  "Spa & Massage",
  "Makeup",
];

const HERO_HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Verified Specialists",
    subtitle: "Certified hair & skin experts",
  },
  {
    icon: CalendarCheck,
    title: "Flexible Time Slots",
    subtitle: "Book according to your schedule",
  },
  {
    icon: Clock,
    title: "Zero Waiting Time",
    subtitle: "Confirmed priority appointments",
  },
];

export default function HeroBanner() {
  return (
    <section className="w-full py-5 transition-colors duration-500 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="group/banner relative flex min-h-[580px] w-full items-center overflow-hidden rounded-3xl border border-amber-500/25 bg-zinc-950 text-white shadow-2xl shadow-amber-950/15 transition-all duration-500 hover:border-amber-500/40 dark:border-amber-400/20 dark:shadow-black/50 dark:hover:border-amber-400/35 md:min-h-[660px]">
          {/* Salon-Themed Background Image */}
          <motion.img
            initial={{ scale: 1.08, opacity: 0.35 }}
            animate={{ scale: 1.02, opacity: 0.5 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={HERO_IMAGE_URL}
            alt="Modern salon styling chairs and warm interior lighting"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover/banner:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Contrast Gradient & Ambient Gold Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/85 to-zinc-950/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl transition-opacity duration-500 group-hover/banner:opacity-100" />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />

          {/* Main Grid Content */}
          <div className="relative z-10 grid w-full grid-cols-1 items-center gap-10 px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Title, Description, CTA & Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="space-y-6 lg:col-span-7"
            >
              {/* Top Luxury Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-1.5 text-xs font-medium text-amber-200 backdrop-blur-md transition-colors duration-300 hover:border-amber-400/50 hover:bg-amber-500/20">
                <Sparkles className="h-3.5 w-3.5 animate-pulse fill-amber-400 text-amber-300" />
                <span>Premium Hair, Skin &amp; Spa Appointment Platform</span>
              </div>

              {/* Hero Title */}
              <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[54px]">
                Elevate Your Everyday Look With{" "}
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                  SalonBook
                </span>
              </h1>

              {/* Short Description */}
              <p className="max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                Discover curated hair styling, skin rejuvenation, bridal
                makeover, and relaxing spa treatments. Pick your preferred
                service, select a convenient time slot, and confirm your
                appointment effortlessly.
              </p>

              {/* Quick Category Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {QUICK_CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href="/services"
                    className="rounded-lg border border-amber-400/20 bg-white/5 px-3 py-1 text-xs font-medium text-amber-100/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/45 hover:bg-amber-500/15 hover:text-amber-300"
                  >
                    {category}
                  </Link>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/services"
                  className="group relative inline-flex h-12 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-7 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/35 active:scale-95"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                  <span>Explore Salon Services</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/services"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-zinc-900/65 px-5 text-sm font-medium text-amber-100 backdrop-blur-md transition-all duration-300 hover:border-amber-400/55 hover:bg-amber-500/15 hover:text-amber-300 active:scale-95"
                >
                  <Scissors className="h-4 w-4 text-amber-400" />
                  <span>View All Categories</span>
                </Link>
              </div>

              {/* Bottom Trust Highlights Strip */}
              <div className="grid grid-cols-1 gap-3 border-t border-amber-400/15 pt-6 sm:grid-cols-3">
                {HERO_HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-3 backdrop-blur-sm transition-colors duration-300 hover:border-amber-400/25 hover:bg-amber-500/5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-100">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Column: Floating Glass Salon Experience Card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
              className="hidden lg:col-span-5 lg:block"
            >
              <div className="relative mx-auto max-w-md rounded-2xl border border-amber-400/25 bg-zinc-900/65 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/45">
                {/* Live Status Header */}
                <div className="flex items-center justify-between border-b border-amber-400/15 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/20">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Signature Salon Care
                      </p>
                      <p className="text-xs text-amber-300/80">
                        Tailored to your personal style
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                    Slots Open
                  </span>
                </div>

                {/* Popular Treatments Preview */}
                <div className="mt-4 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/75">
                    Most Booked Experiences
                  </p>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-amber-400/30 hover:bg-amber-500/10">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Luxury Haircut &amp; Styling
                      </p>
                      <p className="text-xs text-zinc-400">
                        45 Mins • Hair Styling
                      </p>
                    </div>
                    <span className="rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      Popular
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-amber-400/30 hover:bg-amber-500/10">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Hydra Glow Facial &amp; Care
                      </p>
                      <p className="text-xs text-zinc-400">
                        60 Mins • Facial &amp; Skincare
                      </p>
                    </div>
                    <span className="rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      Top Rated
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-amber-400/30 hover:bg-amber-500/10">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Aroma Spa &amp; Deep Massage
                      </p>
                      <p className="text-xs text-zinc-400">
                        75 Mins • Spa &amp; Massage
                      </p>
                    </div>
                    <span className="rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      Relaxing
                    </span>
                  </div>
                </div>

                {/* Rating & Quick Footer */}
                <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-400/20 bg-gradient-to-r from-amber-500/15 to-yellow-500/5 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-white">
                      4.9/5
                    </span>
                  </div>
                  <span className="text-xs text-amber-200/85">
                    Trusted by 1,200+ Clients
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
