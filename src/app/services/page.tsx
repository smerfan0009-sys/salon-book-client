"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, RefreshCw, Sparkles } from "lucide-react";

import ServiceCard, { type SalonService } from "@/app/cards/ServiceCard";

import type { SalonCategory } from "@/app/cards/CategoryCard";

// Remove trailing slash from API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const SKELETON_COUNT = 6;

interface ApiResponse {
  success?: boolean;
  message?: string;
  count?: number;
  data?: unknown;
}

interface CategoriesResponse extends ApiResponse {
  data?: SalonCategory[];
}

// Validate service data received from API
function isSalonService(value: unknown): value is SalonService {
  if (!value || typeof value !== "object") {
    return false;
  }

  const service = value as Record<string, unknown>;

  return (
    typeof service._id === "string" &&
    typeof service.name === "string" &&
    typeof service.category === "string" &&
    typeof service.image === "string" &&
    typeof service.price === "number" &&
    (typeof service.duration === "number" ||
      typeof service.duration === "string")
  );
}

// Loading Skeleton
function ServicesPageSkeleton() {
  return (
    <section className="min-h-screen w-full py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-4">
          <div className="h-7 w-36 animate-pulse rounded-full bg-amber-500/10" />
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="mb-8 flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-10 w-32 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div
              key={index}
              className="h-[390px] animate-pulse rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesPageContent() {
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get("category")?.trim() || null;

  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<SalonCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadServicesPage() {
      setLoading(true);
      setError(null);

      try {
        if (!API_BASE_URL) {
          throw new Error(
            "API URL is not configured. Please check NEXT_PUBLIC_API_URL.",
          );
        }

        // Fetch all active services and categories together
        const [servicesResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/services/`, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }),

          fetch(`${API_BASE_URL}/api/services/categories`, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        const [servicesPayload, categoriesPayload] = await Promise.all([
          servicesResponse.json() as Promise<ApiResponse>,
          categoriesResponse.json() as Promise<CategoriesResponse>,
        ]);

        // Handle API errors
        if (!servicesResponse.ok) {
          throw new Error(
            servicesPayload.message || "Failed to fetch services.",
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesPayload.message || "Failed to fetch categories.",
          );
        }

        // Validate API responses
        if (
          servicesPayload.success !== true ||
          !Array.isArray(servicesPayload.data)
        ) {
          throw new Error(
            servicesPayload.message || "Invalid services response.",
          );
        }

        if (
          categoriesPayload.success !== true ||
          !Array.isArray(categoriesPayload.data)
        ) {
          throw new Error(
            categoriesPayload.message || "Invalid categories response.",
          );
        }

        // Validate individual records
        const validServices = servicesPayload.data.filter(isSalonService);

        const validCategories = categoriesPayload.data.filter(
          (category): category is SalonCategory =>
            !!category &&
            typeof category.name === "string" &&
            typeof category.slug === "string" &&
            typeof category.description === "string" &&
            typeof category.image === "string" &&
            typeof category.serviceCount === "number",
        );

        if (!controller.signal.aborted) {
          setServices(validServices);
          setCategories(validCategories);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Services page fetch error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading services.",
        );

        setServices([]);
        setCategories([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadServicesPage();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  // Find selected category using URL slug
  const selectedCategory = categories.find(
    (category) => category.slug === categorySlug,
  );

  // Filter services according to selected category
  const filteredServices = categorySlug
    ? selectedCategory
      ? services.filter(
          (service) =>
            service.category.trim().toLowerCase() ===
            selectedCategory.name.trim().toLowerCase(),
        )
      : []
    : services;

  const invalidCategory = Boolean(categorySlug && !selectedCategory);

  // Retry API request
  const handleRetry = () => {
    setRetryCount((previous) => previous + 1);
  };

  // Dynamic page content
  const pageTitle = selectedCategory?.name || "All Salon Services";

  const pageDescription =
    selectedCategory?.description ||
    "Explore our complete collection of professional salon services, carefully designed to bring out your best look.";

  return (
    <main className="min-h-screen w-full py-12 transition-colors duration-500 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Home
          </Link>

          <ChevronRight className="h-4 w-4" />

          <Link
            href="/services"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Services
          </Link>

          {selectedCategory && (
            <>
              <ChevronRight className="h-4 w-4" />

              <span className="font-medium text-amber-700 dark:text-amber-300">
                {selectedCategory.name}
              </span>
            </>
          )}
        </div>

        {/* Page Header */}
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />

              <span>
                {selectedCategory ? "Explore Category" : "Our Salon Collection"}
              </span>
            </div>

            {/* Dynamic Title */}
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
              {selectedCategory ? (
                <>
                  Discover{" "}
                  <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400">
                    {selectedCategory.name}
                  </span>
                </>
              ) : (
                <>
                  Discover Our{" "}
                  <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400">
                    Salon Services
                  </span>
                </>
              )}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
              {pageDescription}
            </p>
          </div>

          {/* Service Count */}
          {!loading && !error && !invalidCategory && (
            <div className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-amber-500/25 bg-white/75 px-4 text-sm font-semibold text-amber-800 backdrop-blur-md dark:border-amber-400/20 dark:bg-zinc-950/75 dark:text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "Service" : "Services"} Available
            </div>
          )}
        </div>

        {/* Category Filters */}
        {!loading && !error && categories.length > 0 && (
          <div className="mb-9">
            <div className="flex gap-2.5 overflow-x-auto pb-3">
              <Link
                href="/services"
                className={`inline-flex h-10 shrink-0 items-center rounded-xl border px-4 text-sm font-semibold transition-all duration-300 ${
                  !categorySlug
                    ? "border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/15"
                    : "border-amber-500/25 bg-white/75 text-zinc-700 hover:border-amber-500/50 hover:bg-amber-500/10 dark:border-amber-400/20 dark:bg-zinc-950/75 dark:text-zinc-300 dark:hover:bg-amber-400/10"
                }`}
              >
                All Services
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/services?category=${encodeURIComponent(category.slug)}`}
                  className={`inline-flex h-10 shrink-0 items-center rounded-xl border px-4 text-sm font-semibold transition-all duration-300 ${
                    categorySlug === category.slug
                      ? "border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/15"
                      : "border-amber-500/25 bg-white/75 text-zinc-700 hover:border-amber-500/50 hover:bg-amber-500/10 dark:border-amber-400/20 dark:bg-zinc-950/75 dark:text-zinc-300 dark:hover:bg-amber-400/10"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div
                key={index}
                className="h-[390px] animate-pulse rounded-3xl border border-amber-500/15 bg-white/50 p-4 dark:border-amber-400/15 dark:bg-zinc-900/50"
              >
                <div className="h-48 w-full rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80" />

                <div className="mt-4 h-5 w-3/4 rounded bg-zinc-200/80 dark:bg-zinc-800/80" />

                <div className="mt-3 h-4 w-full rounded bg-zinc-200/70 dark:bg-zinc-800/70" />

                <div className="mt-8 h-10 w-full rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70" />
              </div>
            ))}
          </div>
        )}

        {/* API Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 px-5 py-14 text-center dark:border-red-400/20 dark:bg-red-400/5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <RefreshCw className="h-6 w-6 text-red-500" />
            </div>

            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Unable to Load Services
            </h2>

            <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              We couldn&apos;t retrieve salon services. Please check your
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

        {/* Invalid Category */}
        {!loading && !error && invalidCategory && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 px-5 py-14 text-center dark:border-amber-400/20 dark:bg-amber-400/5">
            <Sparkles className="mx-auto h-10 w-10 text-amber-500" />

            <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Category Not Found
            </h2>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This category may no longer be available.
            </p>

            <Link
              href="/services"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 text-sm font-semibold text-zinc-950 transition-all hover:scale-105"
            >
              Browse All Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          !invalidCategory &&
          filteredServices.length === 0 && (
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 px-5 py-14 text-center dark:border-amber-400/20 dark:bg-amber-400/5">
              <Sparkles className="mx-auto h-10 w-10 text-amber-500" />

              <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No Services Available
              </h2>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {selectedCategory
                  ? `There are currently no active services in ${selectedCategory.name}.`
                  : "Our salon services will be available here soon."}
              </p>

              {selectedCategory && (
                <Link
                  href="/services"
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 text-sm font-semibold text-zinc-950 transition-all hover:scale-105"
                >
                  Browse All Services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

        {/* Services Grid */}
        {!loading && !error && filteredServices.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service._id} service={service} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Suspense is used for useSearchParams()
export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageSkeleton />}>
      <ServicesPageContent />
    </Suspense>
  );
}
