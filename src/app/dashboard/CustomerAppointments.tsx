"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Scissors,
  CreditCard,
  MessageSquare,
  XCircle,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface Appointment {
  _id: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  additionalMessage: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: Appointment[];
}

// --------------------------------------------------
// API CONFIGURATION
// --------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const APPOINTMENTS_URL = `${API_URL.replace(/\/$/, "")}/api/appointments`;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getStatusStyle(status: Appointment["status"]) {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

    case "Pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

    case "Cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    default:
      return "bg-muted text-muted-foreground";
  }
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // ACTION STATES
  // --------------------------------------------------

  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [deletingAllHistory, setDeletingAllHistory] = useState(false);

  // --------------------------------------------------
  // CONFIRMATION DIALOG STATES
  // --------------------------------------------------

  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);

  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);

  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // --------------------------------------------------
  // FETCH APPOINTMENTS
  // --------------------------------------------------

  const fetchAppointments = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(APPOINTMENTS_URL, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    const result = (await response.json()) as ApiResponse;

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to load appointments.");
    }

    setAppointments(result.data || []);
    setError("");
  }, []);

  // --------------------------------------------------
  // INITIAL FETCH
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    const loadAppointments = async () => {
      try {
        await fetchAppointments(controller.signal);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Appointments fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading appointments.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    return () => controller.abort();
  }, [fetchAppointments]);

  // --------------------------------------------------
  // MANUAL REFRESH
  // --------------------------------------------------

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAppointments();
    } catch (err) {
      console.error("Appointments refresh error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to refresh appointments.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // CANCEL APPOINTMENT
  // --------------------------------------------------

  const handleCancel = async () => {
    if (!appointmentToCancel || cancelingId) return;

    const appointmentId = appointmentToCancel._id;

    try {
      setCancelingId(appointmentId);

      const response = await fetch(
        `${APPOINTMENTS_URL}/${appointmentId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel appointment.");
      }

      // Update appointment status
      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: "Cancelled" }
            : appointment,
        ),
      );

      // Close dialog
      setAppointmentToCancel(null);

      toast.success("Appointment cancelled successfully.");
    } catch (err) {
      console.error("Cancel appointment error:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Could not cancel the appointment.",
      );
    } finally {
      setCancelingId(null);
    }
  };

  // --------------------------------------------------
  // DELETE ONE CANCELLED APPOINTMENT HISTORY
  // --------------------------------------------------

  const handleDeleteHistory = async () => {
    if (!appointmentToDelete || deletingId || deletingAllHistory) {
      return;
    }

    const appointmentId = appointmentToDelete._id;

    try {
      setDeletingId(appointmentId);

      const response = await fetch(
        `${APPOINTMENTS_URL}/${appointmentId}/history`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete appointment history.",
        );
      }

      // Update UI
      setAppointments((current) =>
        current.filter((appointment) => appointment._id !== appointmentId),
      );

      // Close dialog
      setAppointmentToDelete(null);

      toast.success("Appointment history deleted successfully.");
    } catch (err) {
      console.error("Delete appointment history error:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete appointment history.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // DELETE ALL CANCELLED APPOINTMENT HISTORY
  // --------------------------------------------------

  const handleDeleteAllHistory = async () => {
    const cancelledCount = appointments.filter(
      (appointment) => appointment.status === "Cancelled",
    ).length;

    if (!cancelledCount || deletingId || deletingAllHistory) {
      return;
    }

    try {
      setDeletingAllHistory(true);

      const response = await fetch(`${APPOINTMENTS_URL}/history/cancelled`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete appointment history.",
        );
      }

      // Update UI
      setAppointments((current) =>
        current.filter((appointment) => appointment.status !== "Cancelled"),
      );

      // Close dialog
      setShowDeleteAllConfirm(false);

      toast.success(
        result.message ||
          "All cancelled appointment history deleted successfully.",
      );
    } catch (err) {
      console.error("Delete all appointment history error:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete appointment history.",
      );
    } finally {
      setDeletingAllHistory(false);
    }
  };

  // --------------------------------------------------
  // DERIVED DATA
  // --------------------------------------------------

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "Cancelled",
  ).length;

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border bg-card">
        <Loader2 className="size-7 animate-spin text-primary" />

        <p className="text-sm text-muted-foreground">
          Loading your appointments...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error && appointments.length === 0) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center">
        <p className="text-sm text-destructive">{error}</p>

        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Try Again
        </Button>
      </div>
    );
  }

  // --------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
        <CalendarDays className="mx-auto mb-4 size-12 text-muted-foreground/50" />

        <h3 className="text-lg font-semibold">No appointments yet</h3>

        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          You haven&apos;t booked any salon appointments yet. Explore our
          services and book your first visit.
        </p>

        <Button className="mt-5">
          <Link href="/services">
            <Scissors className="mr-2 size-4" />
            Explore Services
          </Link>
        </Button>
      </div>
    );
  }

  // --------------------------------------------------
  // APPOINTMENTS LIST
  // --------------------------------------------------

  return (
    <div className="space-y-4">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {appointments.length} appointment(s) found
          </p>

          <p className="text-xs text-muted-foreground">
            Manage your salon bookings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* DELETE ALL HISTORY BUTTON */}

          {cancelledCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={
                deletingAllHistory ||
                !!deletingId ||
                refreshing ||
                !!cancelingId
              }
            >
              <Trash2 className="mr-2 size-4" />
              Delete All History
            </Button>
          )}

          {/* REFRESH BUTTON */}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={
              refreshing || deletingAllHistory || !!deletingId || !!cancelingId
            }
          >
            {refreshing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* REFRESH ERROR */}

      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* APPOINTMENT CARDS */}

      {appointments.map((appointment) => (
        <div
          key={appointment._id}
          className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/30"
        >
          {/* CARD HEADER */}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Scissors className="size-5 text-primary" />

                <h3 className="text-lg font-semibold">
                  {appointment.serviceName}
                </h3>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Appointment ID: {appointment._id}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                appointment.status,
              )}`}
            >
              {appointment.status}
            </span>
          </div>

          {/* APPOINTMENT DETAILS */}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* DATE */}

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <CalendarDays className="size-4 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Appointment Date
                </p>

                <p className="text-sm font-medium">
                  {formatDate(appointment.appointmentDate)}
                </p>
              </div>
            </div>

            {/* TIME */}

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Clock3 className="size-4 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Time Slot</p>

                <p className="text-sm font-medium">
                  {formatTime(appointment.timeSlot)}
                </p>
              </div>
            </div>

            {/* PAYMENT */}

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <CreditCard className="size-4 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Payment Status</p>

                <p className="text-sm font-medium">
                  {appointment.paymentStatus}
                </p>
              </div>
            </div>

            {/* MESSAGE */}

            {appointment.additionalMessage && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <MessageSquare className="size-4 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Additional Message
                  </p>

                  <p className="text-sm font-medium">
                    {appointment.additionalMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* APPOINTMENT ACTIONS */}

          {(appointment.status === "Pending" ||
            appointment.status === "Cancelled") && (
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t pt-4">
              {/* CANCEL BUTTON */}

              {appointment.status === "Pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={
                    cancelingId === appointment._id ||
                    !!deletingId ||
                    deletingAllHistory ||
                    !!cancelingId
                  }
                  onClick={() => setAppointmentToCancel(appointment)}
                >
                  <XCircle className="mr-2 size-4" />
                  Cancel Appointment
                </Button>
              )}

              {/* DELETE HISTORY BUTTON */}

              {appointment.status === "Cancelled" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={
                    deletingId === appointment._id ||
                    deletingAllHistory ||
                    !!cancelingId
                  }
                  onClick={() => setAppointmentToDelete(appointment)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete History
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* ================================================== */}
      {/* CANCEL APPOINTMENT CONFIRMATION */}
      {/* ================================================== */}

      <AlertDialog
        open={!!appointmentToCancel}
        onOpenChange={(open) => {
          if (!cancelingId && !open) {
            setAppointmentToCancel(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to cancel your appointment for{" "}
              <span className="font-semibold text-foreground">
                {appointmentToCancel?.serviceName}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {appointmentToCancel && (
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-sm font-medium">
                {formatDate(appointmentToCancel.appointmentDate)}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {formatTime(appointmentToCancel.timeSlot)}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!cancelingId}>
              Keep Appointment
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={!!cancelingId}
              onClick={(event) => {
                event.preventDefault();
                void handleCancel();
              }}
            >
              {cancelingId ? "Cancelling..." : "Yes, Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================== */}
      {/* INDIVIDUAL DELETE HISTORY CONFIRMATION */}
      {/* ================================================== */}

      <AlertDialog
        open={!!appointmentToDelete}
        onOpenChange={(open) => {
          if (!deletingId && !open) {
            setAppointmentToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appointment history?</AlertDialogTitle>

            <AlertDialogDescription>
              Permanently delete the cancelled appointment for{" "}
              <span className="font-semibold text-foreground">
                {appointmentToDelete?.serviceName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {appointmentToDelete && (
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-sm font-medium">
                {formatDate(appointmentToDelete.appointmentDate)}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {formatTime(appointmentToDelete.timeSlot)}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>
              Keep History
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={!!deletingId}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteHistory();
              }}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================== */}
      {/* DELETE ALL HISTORY CONFIRMATION */}
      {/* ================================================== */}

      <AlertDialog
        open={showDeleteAllConfirm}
        onOpenChange={(open) => {
          if (!deletingAllHistory) {
            setShowDeleteAllConfirm(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all appointment history?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to permanently delete all{" "}
              <span className="font-semibold text-foreground">
                {cancelledCount} cancelled appointment history records
              </span>
              ? Pending and Confirmed appointments will not be affected. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAllHistory}>
              Keep History
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deletingAllHistory || cancelledCount === 0}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteAllHistory();
              }}
            >
              {deletingAllHistory ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
