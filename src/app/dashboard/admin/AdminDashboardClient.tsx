"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ShieldCheck,
  Users,
  CalendarDays,
  Ban,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserRound,
  ArrowRight,
  Scissors,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { apiFetch } from "@/lib/api-fetch";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type DashboardOverview = {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  blockedUsers: number;
};

type AdminAppointment = {
  _id: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  createdAt: string;
  customer?: { name?: string; email?: string };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

async function requestJson<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
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

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time?: string) {
  if (!time) return "—";

  const [h, m] = time.split(":");
  const hour = Number(h);
  if (Number.isNaN(hour)) return time;

  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function getStatusClass(status: string) {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    case "Pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    case "Cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

export default function AdminDashboardClient() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [overviewResult, appointmentsResult] = await Promise.all([
          requestJson<DashboardOverview>("/api/admin/overview", {
            method: "GET",
            cache: "no-store",
          }),
          requestJson<AdminAppointment[]>("/api/admin/appointments", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        if (!active) return;

        setOverview(overviewResult.data);
        setAppointments(appointmentsResult.data);
        setError(null);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load admin dashboard.",
        );
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function handleRefresh() {
    setRefreshing(true);
    setNotice(null);
    setError(null);
    setRefreshKey((current) => current + 1);
  }

  async function handleStatus(
    appointment: AdminAppointment,
    status: "Confirmed" | "Cancelled",
  ) {
    if (busyId) return;

    if (
      status === "Cancelled" &&
      !window.confirm(
        `Cancel the appointment for ${appointment.customer?.name || "this customer"}?`,
      )
    ) {
      return;
    }

    try {
      setBusyId(appointment._id);
      setError(null);
      setNotice(null);

      await requestJson(`/api/appointments/${appointment._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      setNotice(`Appointment ${status.toLowerCase()} successfully.`);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update appointment.",
      );
    } finally {
      setBusyId(null);
    }
  }

  // Pending: soonest appointment first (needs action first)
  const pendingList = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "Pending")
        .sort((a, b) =>
          `${a.appointmentDate} ${a.timeSlot}`.localeCompare(
            `${b.appointmentDate} ${b.timeSlot}`,
          ),
        )
        .slice(0, 5),
    [appointments],
  );

  // Recent: newest requests first
  const recentList = useMemo(
    () =>
      [...appointments]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [appointments],
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-5 animate-spin" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <ShieldCheck className="size-7 text-primary" />
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and manage your SalonBook platform.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* FEEDBACK */}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {notice}
        </div>
      )}

      {/* STAT CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Users"
          value={overview?.totalUsers ?? 0}
          description="Registered platform accounts"
          icon={<Users className="size-5 text-primary" />}
        />
        <StatCard
          title="Appointments"
          value={overview?.totalAppointments ?? 0}
          description="Total booking requests"
          icon={<CalendarDays className="size-5 text-primary" />}
        />
        <StatCard
          title="Pending"
          value={overview?.pendingAppointments ?? 0}
          description="Waiting for confirmation"
          icon={<Clock3 className="size-5 text-amber-500" />}
        />
        <StatCard
          title="Confirmed"
          value={overview?.confirmedAppointments ?? 0}
          description="Confirmed bookings"
          icon={<CheckCircle2 className="size-5 text-emerald-500" />}
        />
        <StatCard
          title="Cancelled"
          value={overview?.cancelledAppointments ?? 0}
          description="Cancelled bookings"
          icon={<XCircle className="size-5 text-red-500" />}
        />
        <StatCard
          title="Blocked Users"
          value={overview?.blockedUsers ?? 0}
          description="Restricted accounts"
          icon={<Ban className="size-5 text-red-500" />}
        />
      </div>

      {/* QUICK LINKS */}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            href: "/dashboard/admin/appointments",
            label: "Manage Appointments",
            icon: <CalendarDays className="size-4 text-primary" />,
          },
          {
            href: "/dashboard/admin/users",
            label: "Manage Users",
            icon: <Users className="size-4 text-primary" />,
          },
          {
            href: "/dashboard/admin/services",
            label: "Manage Services",
            icon: <Scissors className="size-4 text-primary" />,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* PENDING APPOINTMENTS */}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="size-5 text-amber-500" />
                Needs Your Action
              </CardTitle>
              <CardDescription className="mt-1">
                Pending requests, soonest appointment first.
              </CardDescription>
            </div>

            <Link
              href="/dashboard/admin/appointments"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {pendingList.length === 0 ? (
            <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
              <CheckCircle2 className="size-5 text-emerald-500" />
              No pending appointments. You&apos;re all caught up.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingList.map((appointment) => {
                const isBusy = busyId === appointment._id;

                return (
                  <div
                    key={appointment._id}
                    className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {appointment.serviceName || "Salon Service"}
                      </h3>

                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <UserRound className="size-4" />
                        {appointment.customer?.name || "Unknown User"}
                      </p>

                      <p className="mt-1 text-sm">
                        {formatDate(appointment.appointmentDate)} ·{" "}
                        {formatTime(appointment.timeSlot)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => handleStatus(appointment, "Confirmed")}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-4" />
                        {isBusy ? "Updating..." : "Confirm"}
                      </button>

                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => handleStatus(appointment, "Cancelled")}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                      >
                        <XCircle className="size-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECENT APPOINTMENTS */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            Recent Appointments
          </CardTitle>
          <CardDescription>Latest 5 booking requests.</CardDescription>
        </CardHeader>

        <CardContent>
          {recentList.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Customer bookings will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentList.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {appointment.serviceName || "Salon Service"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.customer?.name || "Unknown User"} ·{" "}
                      {formatDate(appointment.appointmentDate)},{" "}
                      {formatTime(appointment.timeSlot)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      appointment.status,
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
