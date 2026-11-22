"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

// Edit these answers to match your real salon policies.
const FAQS: FaqItem[] = [
  {
    question: "How do I book an appointment?",
    answer:
      "Choose a service, pick a date and time slot, and submit your request. You can track it any time from My Appointments.",
  },
  {
    question: "Why does my appointment show as Pending?",
    answer:
      "Every new request starts as Pending while our team checks availability. Once it is confirmed, the status changes and you can pay.",
  },
  {
    question: "How and when do I pay?",
    answer:
      "After your appointment is confirmed, open My Appointments and select Pay Now. You will be taken to a secure checkout, and your status updates to Paid once the payment succeeds.",
  },
  {
    question: "Is online payment safe?",
    answer:
      "Yes. Payments are processed by Stripe on its own secure checkout page. We never see or store your card details.",
  },
  {
    question: "Can I change or cancel my appointment?",
    answer:
      "Contact us as early as you can with your appointment details and we will help you reschedule or cancel.",
  },
  {
    question: "Do I see the price before I book?",
    answer:
      "Yes. Every service lists its price and session duration, so you know exactly what to expect before you submit a request.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="w-full py-12 transition-colors duration-500 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left: heading */}
          <div className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                <span>FAQ</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
                Questions before you book
              </h2>

              <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
                Quick answers about booking, confirmation, and payment. Need
                something else? Browse our services or reach out to our team.
              </p>

              <Link
                href="/services"
                className="inline-flex text-sm font-semibold text-amber-700 underline decoration-amber-500/40 underline-offset-4 transition-colors hover:text-amber-600 hover:decoration-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300 dark:hover:text-amber-200"
              >
                Browse all services
              </Link>
            </div>
          </div>

          {/* Right: accordion */}
          <div className="space-y-3 lg:col-span-8">
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index;
              const buttonId = `faq-button-${index}`;
              const panelId = `faq-panel-${index}`;

              return (
                <div
                  key={item.question}
                  className={`rounded-2xl border transition-colors duration-300 ${
                    isOpen
                      ? "border-amber-500/45 bg-white/80 dark:border-amber-400/40 dark:bg-zinc-900/70"
                      : "border-amber-500/20 bg-white/50 hover:border-amber-500/35 dark:border-amber-400/15 dark:bg-zinc-900/40 dark:hover:border-amber-400/30"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(index)}
                      className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <span className="text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
                        {item.question}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 text-amber-600 transition-transform duration-300 motion-reduce:transition-none dark:text-amber-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {item.answer}
                      </p>
                    </div>
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
