"use client";

import { Quote, Sparkles, Star } from "lucide-react";

interface Testimonial {
  name: string;
  service: string;
  rating: number;
  review: string;
}

// Sample reviews. Replace with real customer feedback, or fetch them from
// your API later and map over the response instead of this array.
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Nusrat Jahan",
    service: "Hydra Glow Facial",
    rating: 5,
    review:
      "Booking took two minutes and my slot was confirmed the same day. The facial was relaxing and my skin looked fresh for days. I paid online right after confirmation, which made the whole visit stress free.",
  },
  {
    name: "Tanvir Ahmed",
    service: "Luxury Haircut & Styling",
    rating: 5,
    review:
      "Walked in on time and was seated straight away. The stylist listened to exactly what I wanted.",
  },
  {
    name: "Farzana Rahman",
    service: "Bridal Makeup",
    rating: 5,
    review:
      "I could compare prices and durations before choosing, and the makeup artist was professional and calm on a busy morning.",
  },
  {
    name: "Rafi Hasan",
    service: "Aroma Spa & Deep Massage",
    rating: 4,
    review:
      "Clean space, friendly staff, and a massage that was worth every minute. Easy to rebook too.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={
            index < rating
              ? "h-4 w-4 fill-amber-400 text-amber-400"
              : "h-4 w-4 text-zinc-300 dark:text-zinc-700"
          }
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [featured, ...others] = TESTIMONIALS;

  return (
    <section
      id="testimonials"
      className="w-full py-12 transition-colors duration-500 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span>Client Reviews</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
              What our clients say after their visit
            </h2>

            <p className="max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
              Honest feedback from people who booked a service through
              SalonBook.
            </p>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/25 bg-white/70 px-4 py-2.5 backdrop-blur-md dark:border-amber-400/20 dark:bg-zinc-900/60">
            <Stars rating={5} />
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              4.9/5 average
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Featured review */}
          <figure className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/30 bg-zinc-950 p-7 text-white shadow-2xl shadow-amber-950/15 sm:p-9 lg:col-span-3 dark:border-amber-400/25">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />

            <Quote
              aria-hidden="true"
              className="relative h-9 w-9 fill-amber-400/20 text-amber-400"
            />

            <blockquote className="relative mt-5 text-lg leading-relaxed text-zinc-100 sm:text-xl">
              {featured.review}
            </blockquote>

            <figcaption className="relative mt-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-zinc-950">
                  {getInitials(featured.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {featured.name}
                  </p>
                  <p className="text-xs text-amber-300/80">
                    {featured.service}
                  </p>
                </div>
              </div>
              <Stars rating={featured.rating} />
            </figcaption>
          </figure>

          {/* Other reviews */}
          <div className="grid grid-cols-1 gap-6 lg:col-span-2">
            {others.map((item) => (
              <figure
                key={item.name}
                className="flex flex-col justify-between rounded-3xl border border-amber-500/20 bg-white/70 p-6 backdrop-blur-md transition-colors duration-300 hover:border-amber-500/45 dark:border-amber-400/15 dark:bg-zinc-900/60 dark:hover:border-amber-400/40"
              >
                <Stars rating={item.rating} />

                <blockquote className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {item.review}
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {getInitials(item.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.service}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
