"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";

import CategoryCard, {
  type SalonCategory,
} from "@/app/cards/CategoryCard";

// Remove trailing slash from API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const CATEGORY_SKELETON_COUNT = 8;

interface CategoriesResponse {
  success?: boolean;
  message?: string;
  count?: number;
  data?: unknown;
}

// Validate category data received from API
function isSalonCategory(value: unknown): value is SalonCategory {
  if (!value || typeof value !== "object") {
    return false;
  }

  const category = value as Record<string, unknown>;

  return (
    typeof category.name === "string" &&
    typeof category.slug === "string" &&
    typeof category.description === "string" &&
    typeof category.image === "string" &&
    typeof category.serviceCount === "number"
  );
}

export default function ServiceCategories() {
  const [categories, setCategories] = useState<SalonCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      setLoading(true);
      setError(null);

      try {
        // Check API URL
        if (!API_BASE_URL) {
          throw new Error(
            "API URL is not configured. Please check NEXT_PUBLIC_API_URL.",
          );
        }

        // Fetch Categories
        const response = await fetch(
          `${API_BASE_URL}/api/services/categories`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const payload = (await response.json()) as CategoriesResponse;

        // Handle API errors
        if (!response.ok) {
          throw new Error(
            payload.message || "Failed to fetch service categories.",
          );
        }

        // Validate API response
        if (payload.success !== true || !Array.isArray(payload.data)) {
          throw new Error(
            payload.message || "Invalid response received from server.",
          );
        }

        // Validate individual categories
        const validCategories = payload.data.filter(isSalonCategory);

        if (validCategories.length === 0 && payload.data.length > 0) {
          throw new Error("Invalid category data received from server.");
        }

        if (!controller.signal.aborted) {
          setCategories(validCategories);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Service categories fetch error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading categories.",
        );

        setCategories([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  // Retry API request
  const handleRetry = () => {
    setRetryCount((previous) => previous + 1);
  };

  return (
    <section className="w-full py-12 transition-colors duration-500 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2.5">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />

              <span>Explore Categories</span>
            </div>

            {/* Section Title */}
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400">
                Perfect Style
              </span>
            </h2>

            {/* Section Description */}
            <p className="max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
              Explore our professional salon categories and find the perfect
              treatments to match your beauty and wellness needs.
            </p>
          </div>

          {/* View All Services */}
          <Link
            href="/services"
            className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-500/35 bg-white/75 px-5 text-sm font-semibold text-amber-800 backdrop-blur-md transition-all duration-300 hover:border-amber-500/60 hover:bg-amber-500/10 active:scale-95 dark:border-amber-400/30 dark:bg-zinc-950/75 dark:text-amber-300 dark:hover:bg-amber-400/10"
          >
            <span>View All Services</span>

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: CATEGORY_SKELETON_COUNT }).map((_, index) => (
              <div
                key={index}
                className="h-[280px] animate-pulse overflow-hidden rounded-3xl border border-amber-500/15 bg-white/50 dark:border-amber-400/15 dark:bg-zinc-900/50"
              >
                <div className="h-full w-full bg-zinc-200/80 dark:bg-zinc-800/80" />
              </div>
            ))}
          </div>
        )}

        {/* API Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 px-5 py-12 text-center dark:border-red-400/20 dark:bg-red-400/5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <RefreshCw className="h-6 w-6 text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Unable to Load Categories
            </h3>

            <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              We couldn&apos;t retrieve the salon categories. Please check your
              connection and try again.
            </p>

            <p className="mt-2 text-xs text-red-500">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 text-sm font-semibold text-zinc-950 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 px-5 py-14 text-center dark:border-amber-400/20 dark:bg-amber-400/5">
            <Sparkles className="mx-auto h-10 w-10 text-amber-500" />

            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              No Categories Available
            </h3>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Our salon categories will be available here soon.
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.slug}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
