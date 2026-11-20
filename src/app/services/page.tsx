"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import ServiceCard, { type SalonService } from "@/app/cards/ServiceCard";

import type { SalonCategory } from "@/app/cards/CategoryCard";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const SKELETON_COUNT = 6;

const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80";

const DEFAULT_DESCRIPTION =
  "Explore our complete collection of professional salon services, carefully designed to bring out your best look.";

type SortOption = "default" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default order" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

/* Shared class names (keeps the amber theme consistent in one place) */
const PRIMARY_BUTTON =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 text-sm font-semibold text-zinc-950 transition-all hover:scale-105 active:scale-95";

const CONTROL_BASE =
  "h-11 w-full rounded-xl border border-amber-500/25 bg-white/75 text-sm text-zinc-800 backdrop-blur-md transition-colors placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-400/20 dark:bg-zinc-950/75 dark:text-zinc-100";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

interface ApiResponse {
  success?: boolean;
  message?: string;
  count?: number;
  data?: unknown;
}

/* -------------------------------------------------------------------------- */
/*                               Helper functions                             */
/* -------------------------------------------------------------------------- */

// Safe object converter
function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

// Convert API service into SalonService format
function normalizeService(value: unknown): SalonService | null {
  const service = toRecord(value);

  if (!service) return null;

  const id = service._id;

  if (typeof id !== "string") {
    return null;
  }

  // Support different possible API field names
  const rawName = service.name ?? service.title ?? service.serviceName;
  const rawImage = service.image ?? service.imageUrl ?? service.coverImage;
  const rawPrice = service.price ?? service.startingPrice;
  const rawDuration = service.duration ?? service.durationMinutes;
  const rawShortDescription = service.shortDescription ?? service.summary;
  const rawDescription = service.description;
  const rawCategory = service.category;

  // Generate a readable name from slug if name is unavailable
  const slug = typeof service.slug === "string" ? service.slug : "";

  const generatedName = slug
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Salon Service";

  const name =
    typeof rawName === "string" && rawName.trim() ? rawName : generatedName;

  const category = typeof rawCategory === "string" ? rawCategory : "General";

  const image =
    typeof rawImage === "string" && rawImage.trim()
      ? rawImage
      : FALLBACK_SERVICE_IMAGE;

  const convertedPrice = Number(rawPrice);

  const price =
    rawPrice !== undefined &&
    rawPrice !== null &&
    Number.isFinite(convertedPrice)
      ? convertedPrice
      : 0;

  const duration =
    typeof rawDuration === "number" || typeof rawDuration === "string"
      ? rawDuration
      : 45;

  return {
    _id: id,
    name,
    slug,
    category,
    image,
    shortDescription:
      typeof rawShortDescription === "string" ? rawShortDescription : undefined,
    description:
      typeof rawDescription === "string" ? rawDescription : undefined,
    price,
    duration,
    featuredOrder:
      typeof service.featuredOrder === "number"
        ? service.featuredOrder
        : undefined,
    createdAt:
      typeof service.createdAt === "string" ? service.createdAt : undefined,
  };
}

// Validate category data
function isSalonCategory(value: unknown): value is SalonCategory {
  const category = toRecord(value);

  if (!category) return false;

  return (
    typeof category.name === "string" &&
    typeof category.slug === "string" &&
    typeof category.description === "string" &&
    typeof category.image === "string" &&
    typeof category.serviceCount === "number"
  );
}

// Normalize category name and slug
function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Search: case-insensitive match on the service name
function searchServices(
  services: SalonService[],
  searchTerm: string,
): SalonService[] {
  const term = searchTerm.trim().toLowerCase();

  if (!term) return services;

  return services.filter((service) =>
    service.name.toLowerCase().includes(term),
  );
}

// Sort: by price. Services without a valid price (0) always go last.
function sortServices(
  services: SalonService[],
  sort: SortOption,
): SalonService[] {
  if (sort === "default") return services;

  const direction = sort === "price-asc" ? 1 : -1;

  return [...services].sort((a, b) => {
    const priceA = Number(a.price);
    const priceB = Number(b.price);

    const missingA = !(priceA > 0);
    const missingB = !(priceB > 0);

    if (missingA && missingB) return 0;
    if (missingA) return 1;
    if (missingB) return -1;

    return (priceA - priceB) * direction;
  });
}

/* -------------------------------------------------------------------------- */
/*                                 Data hook                                  */
/* -------------------------------------------------------------------------- */

function useServicesData() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<SalonCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (!API_BASE_URL) {
          throw new Error(
            "API URL is not configured. Check NEXT_PUBLIC_API_URL.",
          );
        }

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
          categoriesResponse.json() as Promise<ApiResponse>,
        ]);

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

        const normalizedServices = servicesPayload.data
          .map(normalizeService)
          .filter((service): service is SalonService => service !== null);

        const validCategories = categoriesPayload.data.filter(isSalonCategory);

        if (!controller.signal.aborted) {
          setServices(normalizedServices);
          setCategories(validCategories);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Services page fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
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

    load();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  const retry = () => setRetryCount((previous) => previous + 1);

  return { services, categories, loading, error, retry };
}

/* -------------------------------------------------------------------------- */
/*                             Small UI components                            */
/* -------------------------------------------------------------------------- */

function SkeletonGrid() {
  return (
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
  );
}

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

        <SkeletonGrid />
      </div>
    </section>
  );
}

function Breadcrumb({ categoryName }: { categoryName?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-7 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
    >
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

      {categoryName && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-amber-700 dark:text-amber-300">
            {categoryName}
          </span>
        </>
      )}
    </nav>
  );
}

const GRADIENT_TEXT =
  "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400";

function PageHeader({
  categoryName,
  description,
  serviceCount,
}: {
  categoryName?: string;
  description: string;
  serviceCount: number | null; // null hides the badge
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <span>
            {categoryName ? "Explore Category" : "Our Salon Collection"}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
          {categoryName ? (
            <>
              Discover <span className={GRADIENT_TEXT}>{categoryName}</span>
            </>
          ) : (
            <>
              Discover Our <span className={GRADIENT_TEXT}>Salon Services</span>
            </>
          )}
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
          {description}
        </p>
      </div>

      {serviceCount !== null && (
        <div className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-amber-500/25 bg-white/75 px-4 text-sm font-semibold text-amber-800 backdrop-blur-md dark:border-amber-400/20 dark:bg-zinc-950/75 dark:text-amber-300">
          <Sparkles className="h-4 w-4 text-amber-500" />
          {serviceCount} {serviceCount === 1 ? "Service" : "Services"} Available
        </div>
      )}
    </div>
  );
}

function SearchSortToolbar({
  searchTerm,
  onSearchChange,
  sort,
  onSortChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      {/* Search */}
      <div className="relative flex-1">
        <label htmlFor="service-search" className="sr-only">
          Search services by name
        </label>

        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <input
          id="service-search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search services by name..."
          autoComplete="off"
          className={`${CONTROL_BASE} pl-10 pr-10 [&::-webkit-search-cancel-button]:appearance-none`}
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="relative sm:w-64">
        <label htmlFor="service-sort" className="sr-only">
          Sort services
        </label>

        <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <select
          id="service-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className={`${CONTROL_BASE} cursor-pointer appearance-none pl-10 pr-10 font-medium`}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      </div>
    </div>
  );
}

function CategoryFilters({
  categories,
  activeSlug,
}: {
  categories: SalonCategory[];
  activeSlug: string | null;
}) {
  const baseClass =
    "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-300";

  const activeClass =
    "border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/15";

  const idleClass =
    "border-amber-500/25 bg-white/75 text-zinc-700 hover:border-amber-500/50 hover:bg-amber-500/10 dark:border-amber-400/20 dark:bg-zinc-950/75 dark:text-zinc-300 dark:hover:bg-amber-400/10";

  return (
    <div className="mb-5">
      <div
        className="flex gap-2.5 overflow-x-auto pb-3"
        role="navigation"
        aria-label="Filter by category"
      >
        <Link
          href="/services"
          aria-current={!activeSlug ? "page" : undefined}
          className={`${baseClass} ${!activeSlug ? activeClass : idleClass}`}
        >
          All Services
        </Link>

        {categories.map((category) => {
          const isActive = activeSlug === category.slug;

          return (
            <Link
              key={category.slug}
              href={`/services?category=${encodeURIComponent(category.slug)}`}
              aria-current={isActive ? "page" : undefined}
              className={`${baseClass} ${isActive ? activeClass : idleClass}`}
            >
              {category.name}

              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                  isActive
                    ? "bg-zinc-950/15 text-zinc-950"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                }`}
              >
                {category.serviceCount}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 py-1 pl-3 pr-1.5 text-xs font-medium text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
      {label}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-amber-500/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function ResultsBar({
  shown,
  total,
  searchTerm,
  categoryName,
  sort,
  onClearSearch,
  onClearCategory,
  onClearSort,
  onClearAll,
}: {
  shown: number;
  total: number;
  searchTerm: string;
  categoryName?: string;
  sort: SortOption;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearSort: () => void;
  onClearAll: () => void;
}) {
  const trimmedSearch = searchTerm.trim();
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label;

  const hasFilters = Boolean(
    trimmedSearch || categoryName || sort !== "default",
  );

  return (
    <div className="mb-7 flex flex-col gap-3 border-b border-amber-500/15 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/15">
      <p
        className="text-sm text-zinc-600 dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        Showing{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {shown}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {total}
        </span>{" "}
        {total === 1 ? "service" : "services"}
      </p>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {trimmedSearch && (
            <FilterChip
              label={`Search: "${trimmedSearch}"`}
              onRemove={onClearSearch}
            />
          )}

          {categoryName && (
            <FilterChip
              label={`Category: ${categoryName}`}
              onRemove={onClearCategory}
            />
          )}

          {sort !== "default" && sortLabel && (
            <FilterChip label={sortLabel} onRemove={onClearSort} />
          )}

          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-amber-700 underline-offset-4 transition-colors hover:underline dark:text-amber-300"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function StateMessage({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 px-5 py-14 text-center dark:border-amber-400/20 dark:bg-amber-400/5">
      <Sparkles className="mx-auto h-10 w-10 text-amber-500" />

      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        {message}
      </p>

      {children && <div className="mt-6 flex justify-center">{children}</div>}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 px-5 py-14 text-center dark:border-red-400/20 dark:bg-red-400/5">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <RefreshCw className="h-6 w-6 text-red-500" />
      </div>

      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Unable to Load Services
      </h2>

      <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t retrieve salon services. Please check your connection
        and try again.
      </p>

      <p className="mt-2 text-xs text-red-500">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className={`mt-6 ${PRIMARY_BUTTON}`}
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Page content                                */
/* -------------------------------------------------------------------------- */

function ServicesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Category lives in the URL so it can be shared and bookmarked
  const categorySlug = searchParams.get("category")?.trim() || null;

  // Search and sort are local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortOption>("default");

  const { services, categories, loading, error, retry } = useServicesData();

  const selectedCategory = categories.find(
    (category) => category.slug === categorySlug,
  );

  const invalidCategory = Boolean(categorySlug && !selectedCategory);

  // Step 1: filter by category
  const categoryServices = useMemo(() => {
    if (!categorySlug) return services;
    if (!selectedCategory) return [];

    const target = normalizeCategory(selectedCategory.name);

    return services.filter(
      (service) => normalizeCategory(service.category) === target,
    );
  }, [services, categorySlug, selectedCategory]);

  // Step 2: search by name, then Step 3: sort by price
  const visibleServices = useMemo(
    () => sortServices(searchServices(categoryServices, searchTerm), sort),
    [categoryServices, searchTerm, sort],
  );

  const isSearching = searchTerm.trim().length > 0;
  const showContent = !loading && !error;

  // Clear helpers
  const clearCategory = () => router.push("/services", { scroll: false });

  const clearAll = () => {
    setSearchTerm("");
    setSort("default");
    if (categorySlug) clearCategory();
  };

  return (
    <main className="min-h-screen w-full py-12 transition-colors duration-500 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb categoryName={selectedCategory?.name} />

        <PageHeader
          categoryName={selectedCategory?.name}
          description={selectedCategory?.description || DEFAULT_DESCRIPTION}
          serviceCount={
            showContent && !invalidCategory ? categoryServices.length : null
          }
        />

        {/* Category filters */}
        {showContent && categories.length > 0 && (
          <CategoryFilters categories={categories} activeSlug={categorySlug} />
        )}

        {/* Search + sort */}
        {showContent && !invalidCategory && (
          <>
            <SearchSortToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sort={sort}
              onSortChange={setSort}
            />

            <ResultsBar
              shown={visibleServices.length}
              total={categoryServices.length}
              searchTerm={searchTerm}
              categoryName={selectedCategory?.name}
              sort={sort}
              onClearSearch={() => setSearchTerm("")}
              onClearCategory={clearCategory}
              onClearSort={() => setSort("default")}
              onClearAll={clearAll}
            />
          </>
        )}

        {/* Loading */}
        {loading && <SkeletonGrid />}

        {/* API error */}
        {!loading && error && <ErrorState message={error} onRetry={retry} />}

        {/* Invalid category */}
        {showContent && invalidCategory && (
          <StateMessage
            title="Category Not Found"
            message="This category may no longer be available."
          >
            <Link href="/services" className={PRIMARY_BUTTON}>
              Browse All Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </StateMessage>
        )}

        {/* Nothing in this category / site at all */}
        {showContent && !invalidCategory && categoryServices.length === 0 && (
          <StateMessage
            title="No Services Available"
            message={
              selectedCategory
                ? `There are currently no active services in ${selectedCategory.name}.`
                : "Our salon services will be available here soon."
            }
          >
            {selectedCategory && (
              <Link href="/services" className={PRIMARY_BUTTON}>
                Browse All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </StateMessage>
        )}

        {/* Search returned nothing */}
        {showContent &&
          !invalidCategory &&
          categoryServices.length > 0 &&
          visibleServices.length === 0 && (
            <StateMessage
              title="No Matching Services"
              message={
                isSearching
                  ? `We couldn't find any service matching "${searchTerm.trim()}"${
                      selectedCategory ? ` in ${selectedCategory.name}` : ""
                    }. Try a different keyword.`
                  : "No services match your current filters."
              }
            >
              <button
                type="button"
                onClick={clearAll}
                className={PRIMARY_BUTTON}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </StateMessage>
          )}

        {/* Services grid */}
        {showContent && !invalidCategory && visibleServices.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map((service, index) => (
              <ServiceCard key={service._id} service={service} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Suspense required for useSearchParams()
export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageSkeleton />}>
      <ServicesPageContent />
    </Suspense>
  );
}
