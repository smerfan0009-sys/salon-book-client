"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80";

export default function HeroBanner() {
  return (
    <section className="w-full py-5 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-[520px] w-full items-center overflow-hidden rounded-3xl border border-amber-500/25 bg-zinc-950 text-white shadow-2xl shadow-amber-950/15 md:min-h-[600px]">
          {/* Salon-themed background image */}
          <motion.img
            initial={{ scale: 1.08, opacity: 0.35 }}
            animate={{ scale: 1.02, opacity: 0.5 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={HERO_IMAGE_URL}
            alt="Modern salon styling chairs and warm interior lighting"
            className="absolute inset-0 h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
          />

          {/* Contrast overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-zinc-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative z-10 max-w-2xl space-y-6 px-6 py-16 sm:px-10 md:px-14"
          >
            {/* Title */}
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[54px]">
              Elevate Your Everyday Look With{" "}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                SalonBook
              </span>
            </h1>

            {/* Short description */}
            <p className="max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Discover hair styling, skincare, and spa treatments. Pick a
              service, choose a time slot, and confirm your appointment in
              minutes.
            </p>

            {/* CTA button */}
            <Link
              href="/services"
              className="group relative inline-flex h-12 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-7 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/35 active:scale-95"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
              <span>Explore Salon Services</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
