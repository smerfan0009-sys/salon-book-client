"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  Clock,
  RefreshCw,
  CalendarCheck,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { apiFetch } from "@/lib/api-fetch";

interface Appointment {
  _id: string;
  customerId: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  additionalMessage?: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: string;
  createdAt: string;
}

interface AppointmentResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: Appointment[];
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Confirmed":
      return "bg-green-500/10 text-green-600 dark:text-green-400";

    case "Cancelled":
      return "bg-red-500/10 text-red-600 dark:text-red-400";

    default:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }
}

export default function CustomerDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/api/appointments", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AppointmentResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to load appointments.");
      }

      setAppointments(Array.isArray(payload.data) ? payload.data : []);
    } catch (err) {
      console.error("Customer appointments error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading appointments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      try {
        const response = await apiFetch("/api/appointments", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as AppointmentResponse;

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Failed to load appointments.");
        }

        if (!cancelled) {
          setAppointments(Array.isArray(payload.data) ? payload.data : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading appointments.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending",
  ).length;

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <LayoutDashboard className="size-7 text-primary" />
          Customer Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          Welcome back! Manage your salon appointments here.
        </p>
      </div>

      {/* Appointment Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Appointments
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : totalAppointments}
              </p>
            </div>

            <Calendar className="size-8 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : pendingAppointments}
              </p>
            </div>

            <Clock className="size-8 text-amber-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : confirmedAppointments}
              </p>
            </div>

            <CalendarCheck className="size-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* My Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              My Appointments
            </CardTitle>

            <CardDescription>
              View your upcoming and past salon appointments.
            </CardDescription>
          </div>

          <button
            type="button"
            onClick={fetchAppointments}
            disabled={loading}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Refresh appointments"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </CardHeader>

        <CardContent>
          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="size-10 text-destructive" />

              <p className="text-sm text-destructive">{error}</p>

              <button
                type="button"
                onClick={fetchAppointments}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && appointments.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Scissors className="size-8 text-primary" />
              </div>

              <h3 className="text-lg font-semibold">No appointments yet</h3>

              <p className="max-w-sm text-sm text-muted-foreground">
                You haven&apos;t booked any salon services yet. Explore our
                services and book your first appointment.
              </p>

              <Link
                href="/services"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Explore Services
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          {/* Appointment List */}
          {!loading && !error && appointments.length > 0 && (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="rounded-xl border p-4 transition-colors hover:bg-muted/30 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {appointment.serviceName}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(appointment.status)}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Calendar className="size-4 text-primary" />
                          {formatDate(appointment.appointmentDate)}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock className="size-4 text-primary" />
                          {formatTime(appointment.timeSlot)}
                        </span>
                      </div>

                      {appointment.additionalMessage && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="mt-0.5 size-4 shrink-0" />
                          <p>{appointment.additionalMessage}</p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Payment: {appointment.paymentStatus}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="text-xs text-muted-foreground">
                        ID: {appointment._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="size-5 text-primary" />
            Quick Actions
          </CardTitle>

          <CardDescription>Everyday shortcuts.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <Link
            href="/services"
            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
          >
            <span>Browse salon services and book appointments.</span>
            <ArrowRight className="size-4" />
          </Link>

          <p>Manage your profile and password from account settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
