"use client";

import {
  CalendarCheck,
  Clock,
  Gem,
  Lock,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Verified specialists",
    description:
      "Every stylist, skin therapist, and makeup artist is certified and reviewed before joining the platform.",
  },
  {
    icon: CalendarCheck,
    title: "Slots that fit your day",
    description:
      "Pick the date and time that works for you instead of calling around to find an opening.",
  },
  {
    icon: Clock,
    title: "Priority appointments",
    description:
      "Once your booking is confirmed, your slot is held for you, so there is no waiting at the door.",
  },
  {
    icon: Lock,
    title: "Secure online payment",
    description:
      "Pay after confirmation through a protected checkout. Your card details never touch our servers.",
  },
  {
    icon: Gem,
    title: "Premium products",
    description:
      "Treatments use quality hair, skin, and spa products chosen for results and comfort.",
  },
  {
    icon: Sparkles,
    title: "Clear prices and durations",
    description:
      "See the price and session length of every service before you book. No surprises at checkout.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="w-full py-12 transition-colors duration-500 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left: intro */}
          <div className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                <span>Why Choose SalonBook</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
                Book with confidence, arrive and relax
              </h2>

              <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
                We handle the scheduling, confirmation, and payment so the only
                thing left to do is enjoy your treatment.
              </p>

              {/* Quiet gold rule for visual anchor */}
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500" />
            </div>
          </div>

          {/* Right: feature list */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 lg:col-span-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group flex gap-4 border-t border-amber-500/20 py-6 transition-colors duration-300 hover:border-amber-500/55 dark:border-amber-400/15 dark:hover:border-amber-400/45"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-600 group-hover:text-zinc-950 dark:bg-amber-400/10 dark:text-amber-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
