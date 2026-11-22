"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Inbox,
  Loader2,
  Scissors,
  Search,
  Star,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-fetch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Appointment = {
  _id: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  additionalMessage?: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  paymentStatus: "Unpaid" | "Paid";
  servicePrice?: number | string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  feedback?: { rating?: number | null; comment?: string; createdAt?: string };
  service?: {
    price?: number | string;
    duration?: number;
    category?: string;
    image?: string;
  };
};

type ApiResponse<T> = { success: boolean; message?: string; data: T };
type StatusFilter = "All statuses" | Appointment["status"];

function formatPrice(value?: number | string) {
  if (value === undefined || value === null || value === "") return null;
  const price = Number(value);
  return Number.isNaN(price) ? null : `$${price.toLocaleString("en-US")}`;
}

async function requestJson<T>(endpoint: string, options?: RequestInit) {
  const response = await apiFetch(endpoint, options);
  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || "Something went wrong. Please try again.",
    );
  }

  return result;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time?: string) {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  return Number.isNaN(hour)
    ? time
    : `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function statusClass(status: Appointment["status"]) {
  return {
    Confirmed:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    Pending:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    Cancelled: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
    Completed: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  }[status];
}

function ServiceImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-32">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Scissors className="size-7 text-muted-foreground" />
      )}
    </div>
  );
}

function InfoTile({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg bg-muted/50 p-4 ${className}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1.5 break-words font-medium">{value}</p>
    </div>
  );
}

export default function MyAppointmentsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [completionId, setCompletionId] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All statuses");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      try {
        const result = await requestJson<Appointment[]>("/api/appointments", {
          method: "GET",
          cache: "no-store",
        });
        if (active) {
          setAppointments(result.data);
          setLoadError(null);
        }
      } catch (err) {
        if (active) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load appointments.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAppointments();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  async function handleCancel(appointment: Appointment) {
    if (busyId || submittingCompletion) return;

    try {
      setBusyId(appointment._id);
      await requestJson(`/api/appointments/${appointment._id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Appointment request cancelled.");
      setCancelTarget(null);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel appointment.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handlePay(appointment: Appointment) {
    if (busyId || submittingCompletion) return;

    try {
      setBusyId(appointment._id);
      const result = await requestJson<{ url: string }>(
        "/api/payments/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId: appointment._id }),
        },
      );
      window.location.assign(result.data.url);
    } catch (err) {
      setBusyId(null);
      toast.error(
        err instanceof Error ? err.message : "Failed to start payment.",
      );
    }
  }

  function toggleCompletionPanel(appointmentId: string) {
    if (submittingCompletion) return;

    if (completionId === appointmentId) {
      setCompletionId(null);
    } else {
      setCompletionId(appointmentId);
      setRating(null);
      setComment("");
    }
  }

  async function handleComplete(
    appointment: Appointment,
    includeFeedback: boolean,
  ) {
    if (submittingCompletion) return;

    const trimmedComment = includeFeedback ? comment.trim() : "";
    const body: { rating?: number; comment?: string } = {};
    if (includeFeedback && rating !== null) body.rating = rating;
    if (trimmedComment) body.comment = trimmedComment;

    try {
      setSubmittingCompletion(true);
      await requestJson(`/api/appointments/${appointment._id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      toast.success("Appointment marked as completed. Thank you!");
      setCompletionId(null);
      setRating(null);
      setComment("");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      // Includes the "on or after the appointment date" rule from the backend.
      toast.error(
        err instanceof Error ? err.message : "Failed to complete appointment.",
      );
    } finally {
      setSubmittingCompletion(false);
    }
  }

  const shown = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => {
          const query = search.trim().toLowerCase();
          const searchable = [
            appointment.serviceName,
            appointment.service?.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return (
            (status === "All statuses" || appointment.status === status) &&
            (!query || searchable.includes(query))
          );
        })
        .sort((a, b) =>
          `${a.appointmentDate} ${a.timeSlot}`.localeCompare(
            `${b.appointmentDate} ${b.timeSlot}`,
          ),
        ),
    [appointments, search, status],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Appointments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your booking requests, appointments, and payments.
            </p>
          </div>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm">
          <span className="font-semibold tabular-nums">{shown.length}</span>
          <span className="text-muted-foreground">
            {shown.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search service name or category..."
              className="h-10 border-border/70 pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="h-10 rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All statuses</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Cancelled</option>
            <option>Completed</option>
          </select>
        </CardContent>
      </Card>

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm">Loading appointments...</p>
          </div>
        </div>
      ) : shown.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-6 text-muted-foreground" />
            </div>
            <h2 className="mt-4 font-semibold">No appointments yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Book a service to see your appointments here.
            </p>
            <Link
              href="/services"
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Browse services
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {shown.map((appointment) => {
            const price = formatPrice(
              appointment.servicePrice ?? appointment.service?.price,
            );
            const isBusy = busyId === appointment._id;
            const isCompleting = completionId === appointment._id;
            const canPay =
              appointment.status === "Confirmed" &&
              appointment.paymentStatus === "Unpaid" &&
              price !== null;
            const canComplete =
              appointment.status === "Confirmed" &&
              appointment.paymentStatus === "Paid";
            const hasFeedback = rating !== null || comment.trim().length > 0;
            const actionsDisabled = isBusy || submittingCompletion;

            return (
              <Card
                key={appointment._id}
                className="border-border/70 shadow-sm"
              >
                <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <ServiceImage
                      src={appointment.service?.image}
                      alt={appointment.serviceName || "Service"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          {appointment.serviceName || "Salon Service"}
                        </h2>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(appointment.status)}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span>
                          {appointment.service?.category || "Uncategorised"}
                        </span>
                        <span>
                          {appointment.service?.duration
                            ? `${appointment.service.duration} min`
                            : "Duration unavailable"}
                        </span>
                        {price && <span>{price}</span>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            appointment.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {appointment.paymentStatus}
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          #{appointment._id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 border-t pt-5 sm:grid-cols-3">
                    <InfoTile
                      label="Date"
                      value={formatDate(appointment.appointmentDate)}
                    />
                    <InfoTile
                      label="Time"
                      value={formatTime(appointment.timeSlot)}
                    />
                    <InfoTile
                      label="Payment"
                      value={appointment.paymentStatus}
                      className={
                        appointment.paymentStatus === "Paid"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-amber-700 dark:text-amber-300"
                      }
                    />
                  </div>

                  <div className="border-t pt-5">
                    <p className="text-xs text-muted-foreground">Message</p>
                    <p className="mt-1.5 rounded-lg bg-muted/50 p-4 leading-relaxed">
                      {appointment.additionalMessage ||
                        "No additional message."}
                    </p>
                  </div>

                  <div className="grid gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoTile
                      label="Requested on"
                      value={formatDate(appointment.createdAt)}
                    />
                    <InfoTile
                      label="Last updated"
                      value={formatDate(appointment.updatedAt)}
                    />
                    {appointment.confirmedAt && (
                      <InfoTile
                        label="Confirmed on"
                        value={formatDate(appointment.confirmedAt)}
                      />
                    )}
                    {appointment.cancelledAt && (
                      <InfoTile
                        label="Cancelled on"
                        value={formatDate(appointment.cancelledAt)}
                      />
                    )}
                    {appointment.completedAt && (
                      <InfoTile
                        label="Completed on"
                        value={formatDate(appointment.completedAt)}
                      />
                    )}
                  </div>

                  {(appointment.status === "Pending" ||
                    canPay ||
                    canComplete) && (
                    <div className="flex flex-wrap gap-3 border-t pt-5">
                      {appointment.status === "Pending" && (
                        <button
                          type="button"
                          disabled={actionsDisabled}
                          onClick={() => setCancelTarget(appointment)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                        >
                          <XCircle className="size-4" />
                          {isBusy ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      {canPay && (
                        <button
                          type="button"
                          disabled={actionsDisabled}
                          onClick={() => handlePay(appointment)}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CreditCard className="size-4" />
                          {isBusy ? "Redirecting..." : "Pay Now"}
                        </button>
                      )}
                      {canComplete && (
                        <button
                          type="button"
                          disabled={actionsDisabled}
                          onClick={() => toggleCompletionPanel(appointment._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-sky-200 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-900 dark:text-sky-300 dark:hover:bg-sky-950"
                        >
                          <CheckCircle2 className="size-4" />
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  )}

                  {isCompleting && (
                    <div className="flex flex-col gap-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900 dark:bg-sky-950/20">
                      <p className="text-sm text-muted-foreground">
                        Only confirm once you have received your service. This
                          completed appointment will remain in your history.
                      </p>

                      <div>
                        <p className="text-sm font-medium">Rating (optional)</p>
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                              disabled={submittingCompletion}
                              onClick={() =>
                                setRating((current) =>
                                  current === value ? null : value,
                                )
                              }
                              className={`rounded p-1 transition-colors disabled:cursor-not-allowed ${
                                rating !== null && value <= rating
                                  ? "text-amber-400"
                                  : "text-muted-foreground hover:text-amber-400"
                              }`}
                            >
                              <Star
                                className={`size-5 ${
                                  rating !== null && value <= rating
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`feedback-${appointment._id}`}
                          className="text-sm font-medium"
                        >
                          Feedback for the salon (optional)
                        </label>
                        <textarea
                          id={`feedback-${appointment._id}`}
                          value={comment}
                          maxLength={500}
                          disabled={submittingCompletion}
                          onChange={(event) => setComment(event.target.value)}
                          className="mt-2 min-h-24 w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="mt-1 text-right text-xs text-muted-foreground">
                          {comment.length}/500
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={submittingCompletion || !hasFeedback}
                          onClick={() => handleComplete(appointment, true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 className="size-4" />
                          {submittingCompletion
                            ? "Saving..."
                            : "Complete with feedback"}
                        </button>
                        <button
                          type="button"
                          disabled={submittingCompletion}
                          onClick={() => handleComplete(appointment, false)}
                          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submittingCompletion
                            ? "Saving..."
                            : "Complete without feedback"}
                        </button>
                        <button
                          type="button"
                          disabled={submittingCompletion}
                          onClick={() => toggleCompletionPanel(appointment._id)}
                          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget && `Cancel your appointment for ${cancelTarget.serviceName} on ${formatDate(cancelTarget.appointmentDate)}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep appointment</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busyId !== null || submittingCompletion}
              onClick={(event) => {
                event.preventDefault();
                if (cancelTarget) void handleCancel(cancelTarget);
              }}
            >
              {busyId ? "Cancelling..." : "Cancel appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
