"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  CalendarDays,
  CalendarCheck,
  Clock3,
  XCircle,
  CheckCircle2,
  UserRound,
  ShieldCheck,
  CircleDollarSign,
  Trash2,
  MessageSquare,
  History,
  Tag,
  Timer,
  Scissors,
  Search,
  Loader2,
  Inbox,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Eye,
  LayoutDashboard,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

import { apiFetch } from "@/lib/api-fetch";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface ServiceInfo {
  image?: string;
  imageUrl?: string;
  category?: string;
  price?: number | string;
  duration?: number | string;
}

interface Service {
  _id: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  price?: number | string;
  duration?: number | string;
}

interface Appointment {
  _id: string;
  customerId: string;
  serviceId: string;
  serviceName: string;

  serviceImage?: string;
  serviceCategory?: string;
  servicePrice?: number | string;
  serviceDuration?: number | string;
  service?: ServiceInfo;

  appointmentDate: string;
  timeSlot: string;
  additionalMessage?: string;

  status: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: string;

  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

interface AppointmentResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: Appointment[];
}

interface ServiceResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: Service[];
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

// --------------------------------------------------
// FETCH DASHBOARD DATA
// --------------------------------------------------

async function fetchCustomerDashboardData(): Promise<{
  appointments: Appointment[];
  services: Service[];
}> {
  const appointmentResponse = await apiFetch("/api/appointments", {
    method: "GET",
    cache: "no-store",
  });

  const appointmentPayload =
    (await appointmentResponse.json()) as AppointmentResponse;

  if (!appointmentResponse.ok || !appointmentPayload.success) {
    throw new Error(
      appointmentPayload.message || "Failed to load appointments.",
    );
  }

  const appointments = Array.isArray(appointmentPayload.data)
    ? appointmentPayload.data
    : [];

  // Service details are optional: appointments still work if this fails
  let services: Service[] = [];

  try {
    const serviceResponse = await apiFetch("/api/services", {
      method: "GET",
      cache: "no-store",
    });

    const servicePayload = (await serviceResponse.json()) as ServiceResponse;

    if (serviceResponse.ok && servicePayload.success) {
      services = Array.isArray(servicePayload.data) ? servicePayload.data : [];
    } else {
      console.warn(
        "Could not load service information:",
        servicePayload.message,
      );
    }
  } catch (err) {
    console.error("Services loading error:", err);
  }

  return { appointments, services };
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const stamp = (date?: string) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString();
};

const formatDay = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSlot = (time?: string) => {
  if (!time) return "—";

  const [h, m] = time.split(":");
  const hour = Number(h);

  if (Number.isNaN(hour)) return time;

  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const shortId = (id?: string) => (id ? `#${String(id).slice(-10)}` : "—");

const formatPrice = (price?: number | string) => {
  if (price === undefined || price === null || price === "") return null;

  const numeric = Number(price);

  return Number.isNaN(numeric)
    ? String(price)
    : `৳${numeric.toLocaleString("en-BD")}`;
};

const formatDuration = (duration?: number | string) => {
  if (duration === undefined || duration === null || duration === "")
    return null;

  return typeof duration === "number" || /^\d+$/.test(String(duration))
    ? `${duration} min`
    : String(duration);
};

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function StatusBadge({ status }: { status?: string }) {
  const value = String(status || "Unknown").toLowerCase();

  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    unpaid: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        styles[value] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>

          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>

      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function ServiceThumb({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-32">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Scissors className="size-7 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function Confirm({
  open,
  onClose,
  busy,
  action,
  title = "Confirm action",
  text,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  busy: boolean;
  action: () => void;
  title?: string;
  text: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  children?: ReactNode;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>

          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              void action();
            }}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default function CustomerDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAllHistory, setDeletingAllHistory] = useState(false);

  // Confirmation dialog states
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    setError(null);

    try {
      const result = await fetchCustomerDashboardData();

      setAppointments(result.appointments);
      setServices(result.services);
    } catch (err) {
      console.error("Customer dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading appointments.",
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // --------------------------------------------------
  // STATISTICS + FILTERING
  // --------------------------------------------------

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((x) => x.status === "Pending").length,
      confirmed: appointments.filter((x) => x.status === "Confirmed").length,
      cancelled: appointments.filter((x) => x.status === "Cancelled").length,
    }),
    [appointments],
  );

  const shown = useMemo(
    () =>
      appointments.filter((item) => {
        const matchesStatus =
          statusFilter === "all" ||
          String(item.status || "").toLowerCase() === statusFilter;

        const searchText = [
          item._id,
          item.serviceName,
          item.serviceCategory,
          item.appointmentDate,
          item.status,
        ]
          .join(" ")
          .toLowerCase();

        return matchesStatus && searchText.includes(q.toLowerCase());
      }),
    [appointments, q, statusFilter],
  );

  const isAnyActionRunning =
    !!cancellingId || !!deletingId || deletingAllHistory;

  // --------------------------------------------------
  // ACTIONS
  // --------------------------------------------------

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel || cancellingId) return;

    const appointmentId = appointmentToCancel._id;

    setCancellingId(appointmentId);

    try {
      const response = await apiFetch(
        `/api/appointments/${appointmentId}/cancel`,
        { method: "PATCH" },
      );

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "Failed to cancel appointment.");
      }

      setAppointmentToCancel(null);

      toast.success("Appointment cancelled successfully.");

      await load(false);
    } catch (err) {
      console.error("Cancel appointment error:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteAppointmentHistory = async () => {
    if (!appointmentToDelete || deletingId || deletingAllHistory) return;

    const appointmentId = appointmentToDelete._id;

    setDeletingId(appointmentId);

    try {
      const response = await apiFetch(
        `/api/appointments/${appointmentId}/history`,
        { method: "DELETE" },
      );

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Failed to delete appointment history.",
        );
      }

      setAppointments((current) =>
        current.filter((item) => item._id !== appointmentId),
      );

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

  const handleDeleteAllAppointmentHistory = async () => {
    if (stats.cancelled === 0 || deletingId || deletingAllHistory) return;

    setDeletingAllHistory(true);

    try {
      const response = await apiFetch("/api/appointments/history/cancelled", {
        method: "DELETE",
      });

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Failed to delete appointment history.",
        );
      }

      setAppointments((current) =>
        current.filter((appointment) => appointment.status !== "Cancelled"),
      );

      setShowDeleteAllConfirm(false);

      toast.success(
        payload.message ||
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
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* DASHBOARD HEADER */}

      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <LayoutDashboard className="size-7 text-primary" />
          Customer Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          Welcome back! Manage your salon appointments here.
        </p>
      </div>

      {/* METRICS */}

      <MetricGrid>
        <MetricCard
          title="Total Appointments"
          value={stats.total}
          description="All your booking requests"
          icon={<CalendarDays className="size-5" />}
        />

        <MetricCard
          title="Pending"
          value={stats.pending}
          description="Awaiting confirmation"
          icon={<Clock3 className="size-5" />}
        />

        <MetricCard
          title="Confirmed"
          value={stats.confirmed}
          description="Successfully confirmed"
          icon={<CalendarCheck className="size-5" />}
        />

        <MetricCard
          title="Cancelled"
          value={stats.cancelled}
          description="Cancelled bookings"
          icon={<XCircle className="size-5" />}
        />
      </MetricGrid>

      {/* LIST SECTION */}

      <div className="space-y-6">
        {/* PAGE HEADER */}

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="size-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My Appointments
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                View and manage your salon appointment requests.
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

        {/* SEARCH AND FILTERS */}

        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search my appointments..."
                className="h-10 border-border/70 pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {stats.cancelled > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                  onClick={() => setShowDeleteAllConfirm(true)}
                  disabled={isAnyActionRunning || loading}
                >
                  {deletingAllHistory ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete All History
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                onClick={() => void load()}
                disabled={loading || isAnyActionRunning}
                aria-label="Refresh appointments"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CONTENT */}

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-sm">Loading data...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="size-10 text-destructive" />

              <p className="text-sm text-destructive">{error}</p>

              <Button
                type="button"
                onClick={() => void load()}
                disabled={isAnyActionRunning}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Scissors className="size-6 text-primary" />
              </div>

              <h3 className="mt-4 font-semibold">No appointments yet</h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                You haven&apos;t booked any salon services yet. Explore our
                services and book your first appointment.
              </p>

              <Button className="mt-4">
                <Link href="/services">
                  Explore Services
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : shown.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">No records found</h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                No appointments match your search or selected filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {shown.map((item) => {
              const isPending = item.status === "Pending";
              const isCancelled = item.status === "Cancelled";
              const isConfirmed = item.status === "Confirmed";

              const isCancelling = cancellingId === item._id;
              const isDeleting = deletingId === item._id;

              const cancelledByLabel = item.cancelledBy
                ? item.cancelledBy === item.customerId
                  ? "You"
                  : "Admin"
                : "—";

              const matchedService = services.find(
                (service) => String(service._id) === String(item.serviceId),
              );

              const serviceInfo = { ...matchedService, ...item.service };

              const serviceImage =
                item.serviceImage ||
                serviceInfo.image ||
                serviceInfo.imageUrl ||
                "";
              const serviceCategory =
                item.serviceCategory || serviceInfo.category;
              const servicePrice = formatPrice(
                item.servicePrice ?? serviceInfo.price,
              );
              const serviceDuration = formatDuration(
                item.serviceDuration ?? serviceInfo.duration,
              );

              return (
                <Card
                  key={item._id}
                  className="border-border/70 shadow-sm transition-colors hover:border-primary/30"
                >
                  <CardContent className="space-y-4 p-4 sm:p-5">
                    {/* SERVICE AND STATUS */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <ServiceThumb
                        key={serviceImage || item._id}
                        src={serviceImage}
                        alt={item.serviceName || "Service"}
                      />

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {item.serviceName || "Unknown service"}
                          </h3>

                          <StatusBadge status={item.status} />
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {serviceCategory && (
                            <span className="flex items-center gap-1.5">
                              <Tag className="size-4 text-primary" />
                              {serviceCategory}
                            </span>
                          )}

                          {serviceDuration && (
                            <span className="flex items-center gap-1.5">
                              <Timer className="size-4 text-primary" />
                              {serviceDuration}
                            </span>
                          )}

                          {servicePrice && (
                            <span className="flex items-center gap-1.5 font-semibold text-foreground">
                              <CircleDollarSign className="size-4 text-primary" />
                              {servicePrice}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Appointment ID: {shortId(item._id)} · Service ID:{" "}
                          {shortId(item.serviceId)}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border/70" />

                    {/* DATE, TIME AND PAYMENT */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="grid flex-1 grid-cols-2 gap-3 sm:max-w-md">
                        <DetailItem
                          label="Date"
                          icon={<CalendarDays className="size-3.5" />}
                          value={formatDay(item.appointmentDate)}
                        />

                        <DetailItem
                          label="Time"
                          icon={<Clock3 className="size-3.5" />}
                          value={formatSlot(item.timeSlot)}
                        />
                      </div>

                      <div className="sm:min-w-24">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Payment
                        </p>

                        <StatusBadge status={item.paymentStatus || "Unpaid"} />
                      </div>
                    </div>

                    {/* CUSTOMER MESSAGE */}

                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                      <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                      <p
                        className={
                          item.additionalMessage ? "" : "text-muted-foreground"
                        }
                      >
                        {item.additionalMessage || "No additional message."}
                      </p>
                    </div>

                    {/* TIMELINE */}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <DetailItem
                        label="Requested on"
                        icon={<History className="size-3.5" />}
                        value={stamp(item.createdAt)}
                      />

                      <DetailItem
                        label="Last updated"
                        icon={<History className="size-3.5" />}
                        value={stamp(item.updatedAt || item.createdAt)}
                      />

                      {isConfirmed && (
                        <>
                          <DetailItem
                            label="Confirmed on"
                            icon={<CheckCircle2 className="size-3.5" />}
                            value={stamp(item.confirmedAt)}
                          />

                          <DetailItem
                            label="Confirmed by"
                            icon={<ShieldCheck className="size-3.5" />}
                            value={item.confirmedBy ? "Admin" : "—"}
                          />
                        </>
                      )}

                      {isCancelled && (
                        <>
                          <DetailItem
                            label="Cancelled on"
                            icon={<XCircle className="size-3.5" />}
                            value={stamp(item.cancelledAt)}
                          />

                          <DetailItem
                            label="Cancelled by"
                            icon={<UserRound className="size-3.5" />}
                            value={cancelledByLabel}
                          />
                        </>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="h-px bg-border/70" />

                    <div className="flex flex-col justify-end gap-2 sm:flex-row">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Link href={`/services/${item.serviceId}`}>
                          <Eye className="size-4" />
                          View Details
                        </Link>
                      </Button>

                      {isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => setAppointmentToCancel(item)}
                          disabled={isAnyActionRunning || loading}
                        >
                          {isCancelling ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <XCircle className="size-4" />
                          )}
                          Cancel Appointment
                        </Button>
                      )}

                      {isCancelled && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => setAppointmentToDelete(item)}
                          disabled={isAnyActionRunning || loading}
                        >
                          {isDeleting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          Delete History
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}

      <Card className="border-border/70 shadow-sm">
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

      {/* CANCEL APPOINTMENT CONFIRM */}

      <Confirm
        open={!!appointmentToCancel}
        onClose={() => setAppointmentToCancel(null)}
        busy={!!cancellingId}
        action={confirmCancelAppointment}
        title="Cancel appointment?"
        destructive
        cancelLabel="Keep Appointment"
        confirmLabel="Yes, Cancel Appointment"
        text={
          <>
            Are you sure you want to cancel your appointment for{" "}
            <span className="font-semibold text-foreground">
              {appointmentToCancel?.serviceName}
            </span>
            ?
          </>
        }
      >
        {appointmentToCancel && (
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-sm font-medium">
              {formatDay(appointmentToCancel.appointmentDate)}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {formatSlot(appointmentToCancel.timeSlot)}
            </p>
          </div>
        )}
      </Confirm>

      {/* DELETE ONE HISTORY CONFIRM */}

      <Confirm
        open={!!appointmentToDelete}
        onClose={() => setAppointmentToDelete(null)}
        busy={!!deletingId || deletingAllHistory}
        action={handleDeleteAppointmentHistory}
        title="Delete appointment history?"
        destructive
        cancelLabel="Keep History"
        confirmLabel="Delete"
        text={
          <>
            Are you sure you want to permanently delete the cancelled
            appointment for{" "}
            <span className="font-semibold text-foreground">
              {appointmentToDelete?.serviceName}
            </span>
            ? This action cannot be undone.
          </>
        }
      />

      {/* DELETE ALL HISTORY CONFIRM */}

      <Confirm
        open={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        busy={deletingAllHistory}
        action={handleDeleteAllAppointmentHistory}
        title="Delete all appointment history?"
        destructive
        cancelLabel="Keep History"
        confirmLabel="Delete All"
        text={
          <>
            Are you sure you want to permanently delete all{" "}
            <span className="font-semibold text-foreground">
              {stats.cancelled} cancelled appointment history records
            </span>
            ? Pending and Confirmed appointments will not be affected. This
            action cannot be undone.
          </>
        }
      />
    </div>
  );
}
