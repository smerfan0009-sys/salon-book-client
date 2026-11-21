"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api-fetch";

type Appointment = {
  _id: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: "Unpaid" | "Paid";
  servicePrice?: number | string;
  createdAt: string;
  service?: { price?: number | string; duration?: number; category?: string };
};

type ApiResponse<T> = { success: boolean; message?: string; data: T };

function formatPrice(value?: number | string) {
  if (value === undefined || value === null || value === "") return null;

  const price = Number(value);
  return Number.isNaN(price) ? null : `$${price.toLocaleString("en-US")}`;
}

async function requestJson<T>(endpoint: string, options?: RequestInit) {
  const response = await apiFetch(endpoint, options);
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Something went wrong. Please try again.");
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
  if (Number.isNaN(hour)) return time;

  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function statusClass(status: Appointment["status"]) {
  return {
    Confirmed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    Cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  }[status];
}

function paymentClass(status: Appointment["paymentStatus"]) {
  return status === "Paid"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
}

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
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function CustomerDashboardClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result = await requestJson<Appointment[]>("/api/appointments", {
          method: "GET",
          cache: "no-store",
        });
        if (!active) return;
        setAppointments(result.data);
        setError(null);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load your dashboard.",
          );
        }
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
    setError(null);
    setNotice(null);
    setRefreshKey((value) => value + 1);
  }

  async function handleCancel(appointment: Appointment) {
    if (
      busyId ||
      !window.confirm(
        `Cancel your appointment for ${appointment.serviceName} on ${formatDate(appointment.appointmentDate)}?`,
      )
    ) {
      return;
    }

    try {
      setBusyId(appointment._id);
      setError(null);
      setNotice(null);
      await requestJson(`/api/appointments/${appointment._id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      setNotice("Appointment cancelled successfully.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel appointment.");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePay(appointment: Appointment) {
    if (busyId) return;

    try {
      setBusyId(appointment._id);
      setError(null);
      setNotice(null);
      const result = await requestJson<{ url: string }>(
        "/api/payments/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId: appointment._id }),
        },
      );
      window.location.href = result.data.url;
    } catch (err) {
      setBusyId(null);
      setError(err instanceof Error ? err.message : "Failed to start payment.");
    }
  }

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        `${a.appointmentDate} ${a.timeSlot}`.localeCompare(
          `${b.appointmentDate} ${b.timeSlot}`,
        ),
      ),
    [appointments],
  );
  const needsAction = useMemo(
    () =>
      sortedAppointments
        .filter(
          (appointment) =>
            (appointment.status === "Confirmed" &&
              appointment.paymentStatus === "Unpaid") ||
            appointment.status === "Pending",
        )
        .sort((a, b) => {
          const aPriority = a.status === "Confirmed" ? 0 : 1;
          const bPriority = b.status === "Confirmed" ? 0 : 1;
          return (
            aPriority - bPriority ||
            `${a.appointmentDate} ${a.timeSlot}`.localeCompare(
              `${b.appointmentDate} ${b.timeSlot}`,
            )
          );
        })
        .slice(0, 5),
    [sortedAppointments],
  );
  const recentAppointments = useMemo(
    () =>
      [...appointments]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [appointments],
  );

  const counts = {
    total: appointments.length,
    pending: appointments.filter((item) => item.status === "Pending").length,
    confirmed: appointments.filter((item) => item.status === "Confirmed").length,
    cancelled: appointments.filter((item) => item.status === "Cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-5 animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <CalendarDays className="size-7 text-primary" />
            My Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your SalonBook appointments and payments.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Requests" value={counts.total} description="All your appointments" icon={<CalendarDays className="size-5 text-primary" />} />
        <StatCard title="Pending" value={counts.pending} description="Waiting for confirmation" icon={<Clock3 className="size-5 text-amber-500" />} />
        <StatCard title="Confirmed" value={counts.confirmed} description="Confirmed bookings" icon={<CheckCircle2 className="size-5 text-emerald-500" />} />
        <StatCard title="Cancelled" value={counts.cancelled} description="Cancelled bookings" icon={<XCircle className="size-5 text-red-500" />} />
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No appointments yet. <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/services">Browse services</Link> to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Needs Your Action</CardTitle>
              <CardDescription>Appointments that need a response or payment.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {needsAction.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have no appointments that need action.</p>
              ) : needsAction.map((appointment) => {
                const isBusy = busyId === appointment._id;
                const isExpanded = expandedId === appointment._id;
                const price = formatPrice(appointment.servicePrice ?? appointment.service?.price);
                const canPay = appointment.status === "Confirmed" && appointment.paymentStatus === "Unpaid" && price !== null;

                return (
                  <div key={appointment._id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{appointment.serviceName || "Salon Service"}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{formatDate(appointment.appointmentDate)} · {formatTime(appointment.timeSlot)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(appointment.status)}`}>{appointment.status}</span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(appointment.paymentStatus)}`}>{appointment.paymentStatus}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setExpandedId(isExpanded ? null : appointment._id)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                          <ChevronRight className={`size-4 ${isExpanded ? "rotate-90" : ""}`} />
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                        {canPay && <button type="button" disabled={isBusy} onClick={() => handlePay(appointment)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><CreditCard className="size-4" />{isBusy ? "Redirecting..." : "Pay Now"}</button>}
                        {appointment.status === "Pending" && <button type="button" disabled={isBusy} onClick={() => handleCancel(appointment)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"><XCircle className="size-4" />{isBusy ? "Cancelling..." : "Cancel"}</button>}
                      </div>
                    </div>
                    {isExpanded && <div className="mt-5 border-t pt-5"><div className="grid gap-3 sm:grid-cols-3"><InfoTile label="Category" value={appointment.service?.category || "—"} /><InfoTile label="Duration" value={appointment.service?.duration ? `${appointment.service.duration} min` : "—"} />{price && <InfoTile label="Price" value={price} />}</div></div>}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div><CardTitle>Recent Appointments</CardTitle><CardDescription className="mt-1">Your latest booking requests.</CardDescription></div>
              <Link href="/dashboard/customer/appointments" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">View all <ChevronRight className="size-4" /></Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {recentAppointments.map((appointment) => <div key={appointment._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><h3 className="font-semibold">{appointment.serviceName || "Salon Service"}</h3><p className="mt-2 text-sm text-muted-foreground">Requested {formatDate(appointment.createdAt)}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(appointment.status)}`}>{appointment.status}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(appointment.paymentStatus)}`}>{appointment.paymentStatus}</span></div></div>)}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1.5 font-medium">{value}</p></div>;
}
