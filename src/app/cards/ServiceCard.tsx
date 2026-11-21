"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Sparkles } from "lucide-react";

export interface SalonService {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  image: string;
  shortDescription?: string;
  description?: string;
  price: number;
  duration: number | string;
  featuredOrder?: number;
  createdAt?: string;
}

interface ServiceCardProps {
  service: SalonService;
  index?: number;
}

const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80";

export default function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const formattedPrice = Number.isFinite(service.price)
    ? service.price.toLocaleString("en-US")
    : "0";

  const formattedDuration =
    typeof service.duration === "number"
      ? `${service.duration} mins`
      : service.duration || "45 mins";

  const serviceDescription =
    service.shortDescription ||
    service.description ||
    "Discover our professional salon service.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.3),
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-amber-500/20 bg-white/75 shadow-lg shadow-amber-950/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/45 hover:shadow-xl hover:shadow-amber-500/10 dark:border-amber-400/20 dark:bg-zinc-950/75 dark:shadow-black/40 dark:hover:border-amber-400/40"
    >
      {/* Top Gold Shimmer Line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] scale-x-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

      {/* Service Image */}
      <div className="relative h-52 w-full overflow-hidden bg-zinc-900">
        <img
          src={service.image || FALLBACK_SERVICE_IMAGE}
          alt={service.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(event) => {
            const imageElement = event.currentTarget;

            imageElement.onerror = null;
            imageElement.src = FALLBACK_SERVICE_IMAGE;
          }}
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-zinc-950/75 px-3 py-1 text-[11px] font-medium text-amber-200 backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>{service.category}</span>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3.5 inline-flex items-center gap-1 rounded-full border border-white/15 bg-zinc-950/75 px-2.5 py-1 text-xs font-medium text-zinc-200 backdrop-blur-md">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>{formattedDuration}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2.5">
          <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-zinc-900 transition-colors duration-300 group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400">
            {service.name}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {serviceDescription}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-amber-500/15 pt-4 dark:border-amber-400/15">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Starting From
            </span>

            <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-xl font-extrabold text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400">
              ${formattedPrice}
            </span>
          </div>

          <Link
            href={`/services/${service._id}`}
            className="group/btn relative inline-flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-4 text-xs font-semibold text-zinc-950 shadow-sm shadow-amber-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-md hover:shadow-amber-500/30 active:scale-95 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500"
          >
            <span>View Details</span>

            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
