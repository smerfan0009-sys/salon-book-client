"use client";

/**
 * app/services/[id]/page.tsx
 *
 * Protected service details page.
 *  - Not logged in      -> redirected to the login page (and sent back after login)
 *  - Invalid service ID -> clear error message (no API call is made)
 *  - Unknown service    -> "Service not found"
 *  - Inactive service   -> visible, but booking is disabled
 *  - Admin account      -> can view, but cannot submit appointment requests
 *  - Customer           -> can submit an appointment request
 */

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  RefreshCw,
  ShieldAlert,
  Tag,
} from "lucide-react";

import type { SalonService } from "@/app/cards/ServiceCard";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-fetch";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const SERVICE_ENDPOINT = (id: string) =>
  `/api/services/${encodeURIComponent(id)}`;
const APPOINTMENTS_ENDPOINT = "/api/appointments";
const LOGIN_PATH = "/sign-in";

const CURRENCY_SYMBOL = "৳";

const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80";

const MAX_BOOKING_DAYS_AHEAD = 60;
const NOTES_MAX_LENGTH = 300;

// Bookable time slots: 10:00 AM – 7:30 PM, every 30 minutes
const SLOT_START_HOUR = 10;
const SLOT_END_HOUR = 20;

const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100";

const SECONDARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-white/75 px-5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-500/10 dark:border-amber-400/25 dark:bg-zinc-950/75 dark:text-amber-300";

const CONTROL =
  "h-11 w-full rounded-xl border bg-white/80 px-3.5 text-sm text-zinc-800 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950/75 dark:text-zinc-100 [color-scheme:light] dark:[color-scheme:dark]";

const CONTROL_OK =
  "border-amber-500/25 focus:border-amber-500 dark:border-amber-400/20";
const CONTROL_INVALID = "border-red-500/60 focus:border-red-500";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

// The shape this page needs from your auth system.
// If your useAuth() returns something different, adapt the line in the page component.
interface AuthUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

type ServiceDetails = SalonService & { isActive: boolean };

type DetailsErrorKind = "invalid-id" | "not-found" | "unauthorized" | "generic";

interface DetailsError {
  kind: DetailsErrorKind;
  message: string;
}

interface FormErrors {
  date?: string;
  time?: string;
}

/* -------------------------------------------------------------------------- */
/*                               Helper functions                             */
/* -------------------------------------------------------------------------- */

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

// MongoDB ObjectId = 24 hex characters. Anything else is rejected before calling the API.
function isValidServiceId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeServiceDetails(value: unknown): ServiceDetails | null {
  let service = toRecord(value);

  // Support { data: { service: {...} } } as well as { data: {...} }
  const nested = service ? toRecord(service.service) : null;
  if (nested) service = nested;

  if (!service || typeof service._id !== "string") return null;

  const rawName = service.name ?? service.title ?? service.serviceName;
  const rawImage = service.image ?? service.imageUrl ?? service.coverImage;
  const rawPrice = service.price ?? service.startingPrice;
  const rawDuration = service.duration ?? service.durationMinutes;
  const rawShort = service.shortDescription ?? service.summary;

  const slug = typeof service.slug === "string" ? service.slug : "";

  const generatedName = slug
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Salon Service";

  const price = Number(rawPrice);

  // Active rules: isActive/active boolean wins, then status === "active", otherwise assume active
  const flag = service.isActive ?? service.active;
  const isActive =
    typeof flag === "boolean"
      ? flag
      : typeof service.status === "string"
        ? service.status.toLowerCase() === "active"
        : true;

  return {
    _id: service._id,
    name:
      typeof rawName === "string" && rawName.trim() ? rawName : generatedName,
    slug,
    category:
      typeof service.category === "string" ? service.category : "General",
    image:
      typeof rawImage === "string" && rawImage.trim()
        ? rawImage
        : FALLBACK_SERVICE_IMAGE,
    shortDescription: typeof rawShort === "string" ? rawShort : undefined,
    description:
      typeof service.description === "string" ? service.description : undefined,
    price:
      rawPrice !== undefined && rawPrice !== null && Number.isFinite(price)
        ? price
        : 0,
    duration:
      typeof rawDuration === "number" || typeof rawDuration === "string"
        ? rawDuration
        : 45,
    featuredOrder:
      typeof service.featuredOrder === "number"
        ? service.featuredOrder
        : undefined,
    createdAt:
      typeof service.createdAt === "string" ? service.createdAt : undefined,
    isActive,
  };
}

function formatPrice(price: number | string): string {
  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0) return "Price on request";
  return `${CURRENCY_SYMBOL}${value.toLocaleString("en-US")}`;
}

function formatDuration(duration: number | string): string {
  const minutes = Number(duration);

  // Non-numeric strings like "1 hour" are shown as-is
  if (!Number.isFinite(minutes)) return String(duration);

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeLabel(time: string): string {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildTimeSlots(): string[] {
  const slots: string[] = [];

  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour++) {
    for (const minute of ["00", "30"]) {
      slots.push(`${String(hour).padStart(2, "0")}:${minute}`);
    }
  }

  return slots;
}

function isSlotInPast(date: string, time: string): boolean {
  if (date !== toDateString(new Date())) return false;

  const now = new Date();
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute <= now.getHours() * 60 + now.getMinutes();
}

/* -------------------------------------------------------------------------- */
/*                                 Data hook                                  */
/* -------------------------------------------------------------------------- */

function useServiceDetails(id: string, enabled: boolean) {
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DetailsError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const invalidId = !isValidServiceId(id);

  useEffect(() => {
    if (!enabled || invalidId) return;

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFetch(SERVICE_ENDPOINT(id), {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response
          .json()
          .catch(() => ({}))) as ApiResponse;

        if (controller.signal.aborted) return;

        if (response.status === 400) {
          setError({
            kind: "invalid-id",
            message:
              payload.message || "The service ID in this link is not valid.",
          });
          return;
        }

        if (response.status === 404) {
          setError({
            kind: "not-found",
            message:
              payload.message || "This service doesn't exist or was removed.",
          });
          return;
        }

        if (response.status === 401) {
          setError({
            kind: "unauthorized",
            message: "Your session has expired. Please log in again.",
          });
          return;
        }

        if (!response.ok || payload.success === false) {
          throw new Error(
            payload.message || "Failed to fetch service details.",
          );
        }

        const normalized = normalizeServiceDetails(payload.data);

        if (!normalized) {
          setError({
            kind: "not-found",
            message: "This service doesn't exist or was removed.",
          });
          return;
        }

        setService(normalized);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Service details fetch error:", err);

        setError({
          kind: "generic",
          message:
            err instanceof Error
              ? err.message
              : "Something went wrong while loading this service.",
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [id, enabled, invalidId, retryCount]);

  const retry = () => setRetryCount((previous) => previous + 1);

  const invalidIdError: DetailsError | null = invalidId
    ? {
        kind: "invalid-id",
        message: "The service ID in this link is not valid.",
      }
    : null;

  return {
    service,
    loading: enabled && !invalidId && loading,
    error: invalidIdError ?? error,
    retry,
  };
}

/* -------------------------------------------------------------------------- */
/*                             Small UI components                            */
/* -------------------------------------------------------------------------- */

function DetailsSkeleton() {
  return (
    <main className="min-h-screen w-full py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 h-5 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <div className="aspect-[16/10] w-full animate-pulse rounded-3xl bg-zinc-200/80 dark:bg-zinc-800/80" />
            <div className="h-9 w-2/3 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80"
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          <div className="h-[420px] animate-pulse rounded-3xl bg-zinc-200/80 dark:bg-zinc-800/80" />
        </div>
      </div>
    </main>
  );
}

function ErrorPanel({
  tone = "amber",
  icon,
  title,
  message,
  children,
}: {
  tone?: "amber" | "red";
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  const toneClass =
    tone === "red"
      ? "border-red-500/20 bg-red-500/5 dark:border-red-400/20 dark:bg-red-400/5"
      : "border-amber-500/20 bg-amber-500/5 dark:border-amber-400/20 dark:bg-amber-400/5";

  return (
    <main className="min-h-screen w-full py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div
          role="alert"
          className={`flex flex-col items-center rounded-3xl border px-5 py-14 text-center ${toneClass}`}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            {icon}
          </div>

          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </h1>

          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {message}
          </p>

          {children && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Breadcrumb({ service }: { service: ServiceDetails }) {
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

      <ChevronRight className="h-4 w-4" />

      <Link
        href={`/services?category=${encodeURIComponent(normalizeCategory(service.category))}`}
        className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
      >
        {service.category}
      </Link>

      <ChevronRight className="h-4 w-4" />

      <span className="max-w-[16rem] truncate font-medium text-amber-700 dark:text-amber-300">
        {service.name}
      </span>
    </nav>
  );
}

function FactTile({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-white/60 p-4 dark:border-amber-400/15 dark:bg-zinc-900/50">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span className="text-amber-500">{icon}</span>
        {label}
      </div>

      <div className="text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
        {children}
      </div>
    </div>
  );
}

function ServiceInfo({ service }: { service: ServiceDetails }) {
  const description = service.description || service.shortDescription;

  return (
    <div className="space-y-7">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-200 dark:border-amber-400/15 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.name}
          className="h-full w-full object-cover"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.src !== FALLBACK_SERVICE_IMAGE) {
              img.src = FALLBACK_SERVICE_IMAGE;
            }
          }}
        />

        {!service.isActive && (
          <span className="absolute left-4 top-4 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
            Currently unavailable
          </span>
        )}
      </div>

      {/* Title + short description */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-100">
          {service.name}
        </h1>

        {service.shortDescription && service.description && (
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            {service.shortDescription}
          </p>
        )}
      </div>

      {/* Key facts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FactTile icon={<Tag className="h-4 w-4" />} label="Category">
          <Link
            href={`/services?category=${encodeURIComponent(normalizeCategory(service.category))}`}
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            {service.category}
          </Link>
        </FactTile>

        <FactTile
          icon={<Clock className="h-4 w-4" />}
          label="Estimated duration"
        >
          {formatDuration(service.duration)}
        </FactTile>

        <FactTile icon={<Banknote className="h-4 w-4" />} label="Price">
          {formatPrice(service.price)}
        </FactTile>
      </div>

      {/* Description */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          About this service
        </h2>

        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
          {description || "No description has been added for this service yet."}
        </p>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Booking section                              */
/* -------------------------------------------------------------------------- */

function BookingNotice({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        {icon}
      </div>

      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>

      {children}
    </div>
  );
}

function BookingForm({
  service,
  user,
}: {
  service: ServiceDetails;
  user: AuthUser;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    date: string;
    time: string;
  } | null>(null);

  const slots = useMemo(() => buildTimeSlots(), []);

  // Computed on mount so the min/max dates are always relative to "today"
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const last = new Date();
    last.setDate(today.getDate() + MAX_BOOKING_DAYS_AHEAD);
    return { minDate: toDateString(today), maxDate: toDateString(last) };
  }, []);

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!date) next.date = "Please choose a date.";
    else if (date < minDate) next.date = "The date can't be in the past.";
    else if (date > maxDate)
      next.date = `Appointments can be requested up to ${MAX_BOOKING_DAYS_AHEAD} days ahead.`;

    if (!time) next.time = "Please choose a time slot.";
    else if (date && isSlotInPast(date, time))
      next.time = "That time has already passed. Choose a later slot.";

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    // Rule guards (the backend must enforce these too)
    if (user.role?.toLowerCase() === "admin") {
      setFormError(
        "Admin accounts can't submit customer appointment requests.",
      );
      return;
    }

    if (!service.isActive) {
      setFormError("This service is currently unavailable for booking.");
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      const response = await apiFetch(APPOINTMENTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service._id,
          appointmentDate: date,
          timeSlot: time,
          additionalMessage: notes.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as ApiResponse;

      if (response.status === 401) {
        router.replace(
          `${LOGIN_PATH}?redirect=${encodeURIComponent(pathname)}`,
        );
        return;
      }

      if (!response.ok || payload.success === false) {
        throw new Error(
          payload.message ||
            (response.status === 403
              ? "You don't have permission to book this service."
              : "Could not submit your appointment request."),
        );
      }

      setSubmitted({ date, time });
      toast.success("Appointment request submitted.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not submit your appointment request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setDate("");
    setTime("");
    setNotes("");
    setErrors({});
    setFormError(null);
    setSubmitted(null);
  }

  /* ---- Success state ---- */
  if (submitted) {
    return (
      <BookingNotice
        icon={<CheckCircle2 className="h-6 w-6" />}
        title="Request submitted"
        message={`Your request for ${service.name} on ${formatDateLabel(submitted.date)} at ${formatTimeLabel(submitted.time)} has been sent. We'll confirm it shortly.`}
      >
        <div className="flex flex-col gap-2 pt-2">
          <Link href="/services" className={PRIMARY_BUTTON}>
            Browse more services
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={resetForm}
            className={SECONDARY_BUTTON}
          >
            Request another time
          </button>
        </div>
      </BookingNotice>
    );
  }

  /* ---- Form ---- */
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Booking as{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          {user.name || user.email || "your account"}
        </span>
      </p>

      {/* Date */}
      <div>
        <label
          htmlFor="appointment-date"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Appointment date
        </label>

        <input
          id="appointment-date"
          type="date"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={(event) => {
            setDate(event.target.value);
            setErrors((prev) => ({ ...prev, date: undefined }));
          }}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "appointment-date-error" : undefined}
          disabled={submitting}
          className={`${CONTROL} ${errors.date ? CONTROL_INVALID : CONTROL_OK}`}
        />

        {errors.date && (
          <p
            id="appointment-date-error"
            className="mt-1.5 text-xs text-red-500"
          >
            {errors.date}
          </p>
        )}
      </div>

      {/* Time */}
      <div>
        <label
          htmlFor="appointment-time"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Available time slot
        </label>

        <select
          id="appointment-time"
          value={time}
          onChange={(event) => {
            setTime(event.target.value);
            setErrors((prev) => ({ ...prev, time: undefined }));
          }}
          aria-invalid={Boolean(errors.time)}
          aria-describedby={errors.time ? "appointment-time-error" : undefined}
          disabled={submitting}
          className={`${CONTROL} cursor-pointer ${errors.time ? CONTROL_INVALID : CONTROL_OK}`}
        >
          <option value="">Select a time slot</option>

          {slots.map((slot) => (
            <option
              key={slot}
              value={slot}
              disabled={Boolean(date) && isSlotInPast(date, slot)}
            >
              {formatTimeLabel(slot)}
            </option>
          ))}
        </select>

        {errors.time && (
          <p
            id="appointment-time-error"
            className="mt-1.5 text-xs text-red-500"
          >
            {errors.time}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="appointment-notes"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Additional message <span className="font-normal text-zinc-400">(optional)</span>
        </label>

        <textarea
          id="appointment-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={NOTES_MAX_LENGTH}
          rows={3}
          placeholder="Anything we should know before your visit?"
          disabled={submitting}
          className={`${CONTROL} ${CONTROL_OK} h-auto resize-none py-3`}
        />

        <p className="mt-1 text-right text-xs text-zinc-400">
          {notes.length}/{NOTES_MAX_LENGTH}
        </p>
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`${PRIMARY_BUTTON} w-full`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending request...
          </>
        ) : (
          <>
            <CalendarCheck className="h-4 w-4" />
            Request appointment
          </>
        )}
      </button>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        This is a request. Your appointment is confirmed once the salon accepts
        it.
      </p>
    </form>
  );
}

function BookingCard({
  service,
  user,
}: {
  service: ServiceDetails;
  user: AuthUser;
}) {
  const isAdmin = user.role?.toLowerCase() === "admin";

  let content: React.ReactNode;

  if (!service.isActive) {
    // Rule: only active services can be booked
    content = (
      <BookingNotice
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Not available for booking"
        message="This service is currently inactive, so appointments can't be requested right now."
      >
        <Link href="/services" className={`${SECONDARY_BUTTON} w-full`}>
          Browse other services
        </Link>
      </BookingNotice>
    );
  } else if (isAdmin) {
    // Rule: admins can't submit customer appointment requests
    content = (
      <BookingNotice
        icon={<ShieldAlert className="h-6 w-6" />}
        title="Admin account"
        message="Admin accounts can view services but can't submit customer appointment requests. Use a customer account to book."
      />
    );
  } else {
    content = <BookingForm service={service} user={user} />;
  }

  return (
    <aside
      aria-label="Appointment booking"
      className="h-fit rounded-3xl border border-amber-500/25 bg-white/70 p-5 shadow-lg shadow-amber-500/5 backdrop-blur-md sm:p-6 lg:sticky lg:top-24 dark:border-amber-400/20 dark:bg-zinc-900/60"
    >
      <div className="mb-5 flex items-end justify-between gap-3 border-b border-amber-500/15 pb-4 dark:border-amber-400/15">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Price
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatPrice(service.price)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <Clock className="h-4 w-4 text-amber-500" />
          {formatDuration(service.duration)}
        </div>
      </div>

      <h2 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
        Book an appointment
      </h2>

      {content}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

function ServiceDetailsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? "");

  const { data: session, isPending: authLoading } = useSession();
  const user = (session?.user as AuthUser | undefined) ?? null;

  // Rule: protected route. Not logged in -> login, then come back here
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`${LOGIN_PATH}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname]);

  const { service, loading, error, retry } = useServiceDetails(
    id,
    Boolean(user),
  );

  // Checking auth, or redirecting to login
  if (authLoading || !user) return <DetailsSkeleton />;

  if (loading) return <DetailsSkeleton />;

  if (error) {
    switch (error.kind) {
      case "invalid-id":
        return (
          <ErrorPanel
            icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
            title="Invalid service link"
            message={error.message}
          >
            <Link href="/services" className={PRIMARY_BUTTON}>
              <ArrowLeft className="h-4 w-4" />
              Back to services
            </Link>
          </ErrorPanel>
        );

      case "not-found":
        return (
          <ErrorPanel
            icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
            title="Service not found"
            message={error.message}
          >
            <Link href="/services" className={PRIMARY_BUTTON}>
              <ArrowLeft className="h-4 w-4" />
              Back to services
            </Link>
          </ErrorPanel>
        );

      case "unauthorized":
        return (
          <ErrorPanel
            icon={<Lock className="h-6 w-6 text-amber-500" />}
            title="Session expired"
            message={error.message}
          >
            <Link
              href={`${LOGIN_PATH}?redirect=${encodeURIComponent(pathname)}`}
              className={PRIMARY_BUTTON}
            >
              Log in
            </Link>
          </ErrorPanel>
        );

      default:
        return (
          <ErrorPanel
            tone="red"
            icon={<RefreshCw className="h-6 w-6 text-red-500" />}
            title="Unable to load this service"
            message={error.message}
          >
            <button type="button" onClick={retry} className={PRIMARY_BUTTON}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>

            <Link href="/services" className={SECONDARY_BUTTON}>
              Back to services
            </Link>
          </ErrorPanel>
        );
    }
  }

  if (!service) return null;

  return (
    <main className="min-h-screen w-full py-12 transition-colors duration-500 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb service={service} />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ServiceInfo service={service} />

          <BookingCard service={service} user={user} />
        </div>
      </div>
    </main>
  );
}

export default function ServiceDetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <ServiceDetailsPageContent />
    </Suspense>
  );
}
