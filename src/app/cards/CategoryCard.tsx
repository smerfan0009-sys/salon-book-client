"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Sparkles } from "lucide-react";

export interface SalonCategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  serviceCount: number;
}

interface CategoryCardProps {
  category: SalonCategory;
  index?: number;
}

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80";

export default function CategoryCard({
  category,
  index = 0,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.3),
      }}
      className="h-full"
    >
      <Link
        href={`/services?category=${encodeURIComponent(category.slug)}`}
        className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900 shadow-lg shadow-amber-950/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/45 hover:shadow-xl hover:shadow-amber-500/10 dark:border-amber-400/20 dark:shadow-black/40 dark:hover:border-amber-400/40"
      >
        {/* Category Image */}
        <img
          src={category.image || FALLBACK_CATEGORY_IMAGE}
          alt={category.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
          }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/10 transition-all duration-300 group-hover:from-zinc-950/95" />

        {/* Gold Shimmer */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] scale-x-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

        {/* Service Count Badge */}
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-zinc-950/75 px-3 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-amber-400" />

          <span>
            {category.serviceCount}{" "}
            {category.serviceCount === 1 ? "Service" : "Services"}
          </span>
        </div>

        {/* Card Content */}
        <div className="relative z-10 flex flex-col p-5 sm:p-6">
          {/* Category Icon */}
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/30 bg-zinc-950/65 text-amber-400 backdrop-blur-md transition-all duration-300 group-hover:border-amber-300/60 group-hover:bg-amber-400/15">
            <Clock className="h-4 w-4" />
          </div>

          {/* Category Name */}
          <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-amber-300 sm:text-xl">
            {category.name}
          </h3>

          {/* Category Description */}
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-300">
            {category.description}
          </p>

          {/* Card Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Explore Category
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
