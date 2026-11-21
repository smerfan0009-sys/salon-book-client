"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CreditCard, Inbox, Loader2, Scissors, Search, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-fetch";

type Appointment = {
  _id: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  additionalMessage?: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: "Unpaid" | "Paid";
  servicePrice?: number | string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  service?: { price?: number | string; duration?: number; category?: string; image?: string };
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
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || "Something went wrong. Please try again.");
  return result;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(time?: string) {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  return Number.isNaN(hour) ? time : `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function statusClass(status: Appointment["status"]) {
  return { Confirmed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", Pending: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300", Cancelled: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300" }[status];
}

function ServiceImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-32">{src && !failed ? <img src={src} alt={alt} className="size-full object-cover" onError={() => setFailed(true)} /> : <Scissors className="size-7 text-muted-foreground" />}</div>;
}

function InfoTile({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return <div className={`rounded-lg bg-muted/50 p-4 ${className}`}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1.5 break-words font-medium">{value}</p></div>;
}

export default function MyAppointmentsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All statuses");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadAppointments() {
      try {
        const result = await requestJson<Appointment[]>("/api/appointments", { method: "GET", cache: "no-store" });
        if (active) { setAppointments(result.data); setError(null); }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load appointments.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadAppointments();
    return () => { active = false; };
  }, [refreshKey]);

  async function handleCancel(appointment: Appointment) {
    if (busyId || !window.confirm(`Cancel your appointment for ${appointment.serviceName} on ${formatDate(appointment.appointmentDate)}?`)) return;
    try {
      setBusyId(appointment._id); setError(null);
      await requestJson(`/api/appointments/${appointment._id}/cancel`, { method: "PATCH", headers: { "Content-Type": "application/json" } });
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel appointment.");
    } finally { setBusyId(null); }
  }

  async function handlePay(appointment: Appointment) {
    if (busyId) return;
    try {
      setBusyId(appointment._id); setError(null);
      const result = await requestJson<{ url: string }>("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId: appointment._id }) });
      window.location.href = result.data.url;
    } catch (err) {
      setBusyId(null);
      setError(err instanceof Error ? err.message : "Failed to start payment.");
    }
  }

  const shown = useMemo(() => [...appointments].filter((appointment) => {
    const query = search.trim().toLowerCase();
    const searchable = [appointment.serviceName, appointment.service?.category].filter(Boolean).join(" ").toLowerCase();
    return (status === "All statuses" || appointment.status === status) && (!query || searchable.includes(query));
  }).sort((a, b) => `${a.appointmentDate} ${a.timeSlot}`.localeCompare(`${b.appointmentDate} ${b.timeSlot}`)), [appointments, search, status]);

  return <div className="flex flex-col gap-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="size-6" /></div><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Appointments</h1><p className="mt-1 text-sm text-muted-foreground">Review your booking requests, appointments, and payments.</p></div></div>
      <div className="flex w-fit items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm"><span className="font-semibold tabular-nums">{shown.length}</span><span className="text-muted-foreground">{shown.length === 1 ? "result" : "results"}</span></div>
    </div>
    <Card className="border-border/70 shadow-sm"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5"><div className="relative flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search service name or category..." className="h-10 border-border/70 pl-9" /></div><select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="h-10 rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"><option>All statuses</option><option>Pending</option><option>Confirmed</option><option>Cancelled</option></select></CardContent></Card>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
    {loading ? <div className="flex min-h-60 items-center justify-center"><div className="flex flex-col items-center gap-3 text-muted-foreground"><Loader2 className="size-7 animate-spin text-primary" /><p className="text-sm">Loading appointments...</p></div></div> : shown.length === 0 ? <Card className="border-dashed shadow-none"><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><div className="flex size-14 items-center justify-center rounded-full bg-muted"><Inbox className="size-6 text-muted-foreground" /></div><h2 className="mt-4 font-semibold">No appointments yet</h2><p className="mt-1 text-sm text-muted-foreground">Book a service to see your appointments here.</p><Link href="/services" className="mt-4 text-sm font-medium text-primary hover:underline">Browse services</Link></CardContent></Card> : <div className="flex flex-col gap-5">
      {shown.map((appointment) => {
        const price = formatPrice(appointment.servicePrice ?? appointment.service?.price);
        const isBusy = busyId === appointment._id;
        const canPay = appointment.status === "Confirmed" && appointment.paymentStatus === "Unpaid" && price !== null;
        return <Card key={appointment._id} className="border-border/70 shadow-sm"><CardContent className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start"><ServiceImage src={appointment.service?.image} alt={appointment.serviceName || "Service"} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{appointment.serviceName || "Salon Service"}</h2><span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(appointment.status)}`}>{appointment.status}</span></div><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"><span>{appointment.service?.category || "Uncategorised"}</span><span>{appointment.service?.duration ? `${appointment.service.duration} min` : "Duration unavailable"}</span>{price && <span>{price}</span>}</div><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-medium ${appointment.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>{appointment.paymentStatus}</span><span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">#{appointment._id.slice(-8)}</span></div></div></div>
          <div className="grid gap-3 border-t pt-5 sm:grid-cols-3"><InfoTile label="Date" value={formatDate(appointment.appointmentDate)} /><InfoTile label="Time" value={formatTime(appointment.timeSlot)} /><InfoTile label="Payment" value={appointment.paymentStatus} className={appointment.paymentStatus === "Paid" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"} /></div>
          <div className="border-t pt-5"><p className="text-xs text-muted-foreground">Message</p><p className="mt-1.5 rounded-lg bg-muted/50 p-4 leading-relaxed">{appointment.additionalMessage || "No additional message."}</p></div>
          <div className="grid gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3"><InfoTile label="Requested on" value={formatDate(appointment.createdAt)} /><InfoTile label="Last updated" value={formatDate(appointment.updatedAt)} />{appointment.confirmedAt && <InfoTile label="Confirmed on" value={formatDate(appointment.confirmedAt)} />}{appointment.cancelledAt && <InfoTile label="Cancelled on" value={formatDate(appointment.cancelledAt)} />}</div>
          {(appointment.status === "Pending" || canPay) && <div className="flex flex-wrap gap-3 border-t pt-5">{appointment.status === "Pending" && <button type="button" disabled={isBusy} onClick={() => handleCancel(appointment)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"><XCircle className="size-4" />{isBusy ? "Cancelling..." : "Cancel"}</button>}{canPay && <button type="button" disabled={isBusy} onClick={() => handlePay(appointment)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><CreditCard className="size-4" />{isBusy ? "Redirecting..." : "Pay Now"}</button>}</div>}
        </CardContent></Card>;
      })}
    </div>}
  </div>;
}
