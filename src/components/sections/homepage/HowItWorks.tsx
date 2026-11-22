"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Scissors,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Scissors,
    title: "Choose Your Service",
    description:
      "Browse hair, skin, makeup, and spa treatments, then pick the one that suits you.",
  },
  {
    step: "02",
    icon: CalendarClock,
    title: "Book a Time Slot",
    description:
      "Select a date and time that fits your schedule and submit your appointment request.",
  },
  {
    step: "03",
    icon: BadgeCheck,
    title: "Get Confirmed",
    description:
      "Our team reviews your request and confirms your appointment, so your slot is reserved.",
  },
  {
    step: "04",
    icon: CreditCard,
    title: "Pay Securely & Relax",
    description:
      "Once confirmed, pay online through secure checkout from My Appointments and enjoy your visit.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full py-12 transition-colors duration-500 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>How It Works</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
            Your Appointment In{" "}
            <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400">
              4 Easy Steps
            </span>
          </h2>

          <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
            From picking a treatment to paying securely, booking with SalonBook
            is simple and transparent.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop only) */}
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-[52px] hidden h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent lg:block" />

          {STEPS.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="group relative rounded-3xl border border-amber-500/20 bg-white/70 p-6 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/45 hover:shadow-xl hover:shadow-amber-500/10 dark:border-amber-400/15 dark:bg-zinc-900/60 dark:hover:border-amber-400/40"
              >
                {/* Step number */}
                <span className="absolute right-5 top-4 text-3xl font-bold text-amber-500/15 transition-colors duration-300 group-hover:text-amber-500/30 dark:text-amber-400/15">
                  {item.step}
                </span>

                {/* Icon */}
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/services"
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-7 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/35 active:scale-95"
          >
            <span>Book Your Appointment</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
