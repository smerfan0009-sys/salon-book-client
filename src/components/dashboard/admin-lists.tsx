"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  CalendarDays,
  CalendarCheck,
  Clock3,
  XCircle,
  CheckCircle2,
  Users,
  UserRound,
  ShieldCheck,
  Ban,
  CreditCard,
  Receipt,
  Search,
  Loader2,
  Inbox,
  CircleDollarSign,
  Trash2,
  MessageSquare,
  History,
  Tag,
  Timer,
  Scissors,
  Star,
} from "lucide-react";

import { toast } from "sonner";

import { apiFetch } from "@/lib/api-fetch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
// API HELPERS
// --------------------------------------------------

async function request(path: string, init?: RequestInit) {
  const response = await apiFetch(path, init);
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

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

const getInitials = (name?: string) => {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const getUserImage = (user: any) => {
  return (
    user?.image ||
    user?.avatar ||
    user?.avatarUrl ||
    user?.imageUrl ||
    user?.profileImage ||
    user?.profilePicture ||
    user?.photoURL ||
    user?.photoUrl ||
    ""
  );
};

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function UserAvatar({
  user,
  size = "md",
}: {
  user: any;
  size?: "sm" | "md" | "lg";
}) {
  const image = getUserImage(user);

  const sizeClass = {
    sm: "size-9 text-xs",
    md: "size-11 text-sm",
    lg: "size-14 text-base",
  }[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary ${sizeClass}`}
    >
      <span>{getInitials(user?.name)}</span>

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={user?.name || "User"}
          className="absolute inset-0 size-full rounded-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const value = String(status || "Unknown").toLowerCase();

  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
    completed: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    blocked: "bg-red-500/10 text-red-600 border-red-500/20",
    admin: "bg-primary/10 text-primary border-primary/20",
    customer: "bg-blue-500/10 text-blue-600 border-blue-500/20",
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

function AdminList({
  title,
  subtitle,
  icon,
  loading,
  q,
  setQ,
  filters,
  count,
  empty,
  emptyMessage,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  loading: boolean;
  q: string;
  setQ: (value: string) => void;
  filters: ReactNode;
  count: number;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm">
          <span className="font-semibold tabular-nums">{count}</span>
          <span className="text-muted-foreground">
            {count === 1 ? "result" : "results"}
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
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-10 border-border/70 pl-9"
            />
          </div>

          {filters}
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
      ) : empty ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-6 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-semibold">No records found</h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function Confirm({
  target,
  setTarget,
  busy,
  action,
  text,
}: {
  target: any;
  setTarget: (value: any) => void;
  busy: boolean;
  action: () => void;
  text: string;
}) {
  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open && !busy) setTarget(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm action</AlertDialogTitle>

          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>

          <AlertDialogAction
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
              "Confirm"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --------------------------------------------------
// APPOINTMENT MANAGEMENT
// --------------------------------------------------

export function AppointmentList() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await request("/api/admin/appointments", {
        cache: "no-store",
      });

      setItems(response.data || []);
      setLoadError(null);

      // Service details are optional: appointments still work if this fails
      try {
        const serviceResponse = await request("/api/services", {
          cache: "no-store",
        });

        setServices(serviceResponse.data || []);
      } catch (serviceError) {
        console.warn("Could not load service details:", serviceError);
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load appointments.",
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(
    () =>
      items.filter((item) => {
        const matchesStatus =
          status === "all" ||
          String(item.status || "").toLowerCase() === status;

        const searchText = [
          item._id,
          item.customerId,
          item.serviceName,
          item.customer?.name,
          item.customer?.email,
        ]
          .join(" ")
          .toLowerCase();

        return matchesStatus && searchText.includes(q.toLowerCase());
      }),
    [items, q, status],
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((x) => x.status === "Pending").length,
      confirmed: items.filter((x) => x.status === "Confirmed").length,
      cancelled: items.filter((x) => x.status === "Cancelled").length,
      completed: items.filter((x) => x.status === "Completed").length,
    }),
    [items],
  );

  const update = async () => {
    if (!target) return;

    setBusy(true);

    try {
      await request(`/api/appointments/${target._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target.next }),
      });

      toast.success(`Appointment ${target.next.toLowerCase()}.`);

      setTarget(null);

      await load(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update appointment.",
      );
    } finally {
      setBusy(false);
    }
  };

  // DELETE ONE CANCELLED APPOINTMENT HISTORY
  const deleteHistory = async () => {
    if (!deleteTarget || busy) return;

    const appointmentId = deleteTarget._id;

    setBusy(true);

    try {
      await request(`/api/appointments/admin/${appointmentId}/history`, {
        method: "DELETE",
      });

      setItems((current) =>
        current.filter((item) => item._id !== appointmentId),
      );

      setDeleteTarget(null);

      toast.success("Appointment history deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete appointment history.",
      );
    } finally {
      setBusy(false);
    }
  };

  // DELETE ALL CANCELLED APPOINTMENT HISTORY
  const deleteAllHistory = async () => {
    if (stats.cancelled === 0 || busy) return;

    setBusy(true);

    try {
      const response = await request(
        "/api/appointments/admin/history/cancelled",
        { method: "DELETE" },
      );

      setItems((current) =>
        current.filter((item) => item.status !== "Cancelled"),
      );

      setDeleteAllOpen(false);

      toast.success(
        response.message || "All cancelled appointment history deleted.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete appointment history.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <MetricGrid>
        <MetricCard
          title="Total Appointments"
          value={stats.total}
          description="All booking requests"
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

        <MetricCard
          title="Completed"
          value={stats.completed}
          description="Services delivered"
          icon={<CheckCircle2 className="size-5 text-sky-500" />}
        />
      </MetricGrid>

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {loadError}
        </div>
      )}

      <AdminList
        title="Manage Appointments"
        subtitle="Review booking requests and manage appointment status."
        icon={<CalendarDays className="size-6" />}
        loading={loading}
        q={q}
        setQ={setQ}
        count={shown.length}
        empty={shown.length === 0}
        emptyMessage="No appointments match your search or selected filter."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>

            {stats.cancelled > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                onClick={() => setDeleteAllOpen(true)}
                disabled={busy}
              >
                <Trash2 className="size-4" />
                Delete All History
              </Button>
            )}
          </div>
        }
      >
        {shown.map((item) => {
          const isCancelled = item.status === "Cancelled";
          const isConfirmed = item.status === "Confirmed";
          const isCompleted = item.status === "Completed";

          const cancelledByLabel = item.cancelledBy
            ? item.cancelledBy === item.customerId
              ? "Customer"
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
          const serviceCategory = item.serviceCategory || serviceInfo.category;
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

                {/* CUSTOMER AND DETAILS */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <UserAvatar user={item.customer} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.customer?.name || "Unknown customer"}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {item.customer?.email || "No email available"}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Customer ID: {shortId(item.customerId)}
                      </p>
                    </div>
                  </div>

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
                    {item.additionalMessage ||
                      "No additional message from customer."}
                  </p>
                </div>

                {isCompleted && (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="font-medium">Feedback</p>
                    {item.feedback?.rating ? (
                      <div className="mt-2 flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`size-4 ${
                              rating <= item.feedback.rating
                                ? "fill-current"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {item.feedback.rating} of 5
                        </span>
                      </div>
                    ) : null}
                    <p className="mt-2 text-muted-foreground">
                      {item.feedback?.comment || "No feedback given."}
                    </p>
                  </div>
                )}

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
                    value={stamp(item.updatedAt)}
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

                  {isCompleted && (
                    <DetailItem
                      label="Completed on"
                      icon={<CheckCircle2 className="size-3.5 text-sky-500" />}
                      value={stamp(item.completedAt)}
                    />
                  )}
                </div>

                {/* ACTIONS: PENDING */}

                {item.status === "Pending" && (
                  <>
                    <div className="h-px bg-border/70" />

                    <div className="flex flex-col justify-end gap-2 sm:flex-row">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() =>
                          setTarget({ ...item, next: "Cancelled" })
                        }
                      >
                        <XCircle className="size-4" />
                        Cancel appointment
                      </Button>

                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          setTarget({ ...item, next: "Confirmed" })
                        }
                      >
                        <CheckCircle2 className="size-4" />
                        Confirm appointment
                      </Button>
                    </div>
                  </>
                )}

                {/* ACTIONS: CANCELLED */}

                {isCancelled && (
                  <>
                    <div className="h-px bg-border/70" />

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                        onClick={() => setDeleteTarget(item)}
                        disabled={busy}
                      >
                        <Trash2 className="size-4" />
                        Delete History
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </AdminList>

      {/* STATUS CHANGE CONFIRM */}
      <Confirm
        target={target}
        setTarget={setTarget}
        busy={busy}
        action={update}
        text={`Change this pending appointment to ${target?.next}?`}
      />

      {/* DELETE ONE HISTORY CONFIRM */}
      <Confirm
        target={deleteTarget}
        setTarget={setDeleteTarget}
        busy={busy}
        action={deleteHistory}
        text={`Permanently delete the cancelled appointment for ${deleteTarget?.serviceName || "this service"} (${deleteTarget?.customer?.name || "unknown customer"})? This action cannot be undone.`}
      />

      {/* DELETE ALL HISTORY CONFIRM */}
      <Confirm
        target={deleteAllOpen ? true : null}
        setTarget={() => setDeleteAllOpen(false)}
        busy={busy}
        action={deleteAllHistory}
        text={`Permanently delete all ${stats.cancelled} cancelled appointment records of ALL customers? Pending and Confirmed appointments will not be affected. This action cannot be undone.`}
      />
    </div>
  );
}

// --------------------------------------------------
// USER MANAGEMENT
// --------------------------------------------------

export function UserList() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [target, setTarget] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await request("/api/admin/users", {
        cache: "no-store",
      });

      setItems(response.data || []);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load users.",
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(
    () =>
      items.filter((item) => {
        const matchesRole =
          role === "all" || String(item.role || "").toLowerCase() === role;

        const searchText = [item.name, item.email, item.role]
          .join(" ")
          .toLowerCase();

        return matchesRole && searchText.includes(q.toLowerCase());
      }),
    [items, q, role],
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      customers: items.filter((x) => x.role === "customer").length,
      admins: items.filter((x) => x.role === "admin").length,
      blocked: items.filter((x) => x.isBlocked).length,
    }),
    [items],
  );

  const update = async () => {
    if (!target) return;

    setBusy(true);

    try {
      await request(
        `/api/admin/users/${target._id}/${target.isBlocked ? "unblock" : "block"}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Blocked by SalonBook admin.",
          }),
        },
      );

      toast.success("User status updated.");

      setTarget(null);

      await load(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update user.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <MetricGrid>
        <MetricCard
          title="Total Users"
          value={stats.total}
          description="Registered accounts"
          icon={<Users className="size-5" />}
        />

        <MetricCard
          title="Customers"
          value={stats.customers}
          description="Customer accounts"
          icon={<UserRound className="size-5" />}
        />

        <MetricCard
          title="Administrators"
          value={stats.admins}
          description="Admin accounts"
          icon={<ShieldCheck className="size-5" />}
        />

        <MetricCard
          title="Blocked Users"
          value={stats.blocked}
          description="Restricted accounts"
          icon={<Ban className="size-5" />}
        />
      </MetricGrid>

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {loadError}
        </div>
      )}

      <AdminList
        title="Manage Users"
        subtitle="View registered users and manage account access."
        icon={<Users className="size-6" />}
        loading={loading}
        q={q}
        setQ={setQ}
        count={shown.length}
        empty={shown.length === 0}
        emptyMessage="No users match your search or selected role."
        filters={
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-10 rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        }
      >
        {shown.map((item) => (
          <Card
            key={item._id}
            className="border-border/70 shadow-sm transition-colors hover:border-primary/30"
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              {/* USER INFORMATION */}

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar user={item} size="lg" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">
                      {item.name || "Unnamed user"}
                    </h3>

                    <StatusBadge status={item.role || "Unknown"} />
                  </div>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {item.email || "No email available"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    User ID: #{String(item._id).slice(-10)}
                  </p>
                </div>
              </div>

              {/* REGISTRATION DATE */}

              <div className="rounded-lg bg-muted/50 px-3 py-2 sm:min-w-44">
                <p className="text-xs text-muted-foreground">Registered on</p>

                <p className="mt-1 text-sm font-medium">
                  {stamp(item.createdAt)}
                </p>
              </div>

              {/* ACCOUNT STATUS */}

              <div className="flex items-center justify-between gap-3 sm:min-w-40 sm:justify-end">
                <StatusBadge status={item.isBlocked ? "Blocked" : "Active"} />

                {item.role !== "admin" && (
                  <Button
                    size="sm"
                    variant={item.isBlocked ? "outline" : "destructive"}
                    className="gap-2"
                    onClick={() => setTarget(item)}
                  >
                    {item.isBlocked ? (
                      <>
                        <ShieldCheck className="size-4" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban className="size-4" />
                        Block
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </AdminList>

      <Confirm
        target={target}
        setTarget={setTarget}
        busy={busy}
        action={update}
        text={`${target?.isBlocked ? "Unblock" : "Block"} ${target?.name}?`}
      />
    </div>
  );
}

// --------------------------------------------------
// TRANSACTION MANAGEMENT
// --------------------------------------------------

export function TransactionList() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await request("/api/admin/transactions", {
          cache: "no-store",
        });

        setItems(response.data || []);
        setLoadError(null);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load transactions.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getPaymentStatus = (item: any) =>
    String(item.paymentStatus || item.status || "unknown").toLowerCase();

  const shown = useMemo(
    () =>
      items.filter((item) => {
        const paymentStatus = getPaymentStatus(item);

        const matchesStatus = status === "all" || paymentStatus === status;

        const searchText = [
          item._id,
          item.transactionId,
          item.appointmentId,
          item.paymentMethod,
          item.amount,
          paymentStatus,
        ]
          .join(" ")
          .toLowerCase();

        return matchesStatus && searchText.includes(q.toLowerCase());
      }),
    [items, q, status],
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      paid: items.filter((x) => getPaymentStatus(x) === "paid").length,
      pending: items.filter((x) => getPaymentStatus(x) === "pending").length,
      failed: items.filter((x) => getPaymentStatus(x) === "failed").length,
    }),
    [items],
  );

  return (
    <div className="space-y-6">
      <MetricGrid>
        <MetricCard
          title="Total Transactions"
          value={stats.total}
          description="Recorded transactions"
          icon={<Receipt className="size-5" />}
        />

        <MetricCard
          title="Successful Payments"
          value={stats.paid}
          description="Paid transactions"
          icon={<CheckCircle2 className="size-5" />}
        />

        <MetricCard
          title="Pending Payments"
          value={stats.pending}
          description="Awaiting payment"
          icon={<Clock3 className="size-5" />}
        />

        <MetricCard
          title="Failed Payments"
          value={stats.failed}
          description="Unsuccessful payments"
          icon={<XCircle className="size-5" />}
        />
      </MetricGrid>

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {loadError}
        </div>
      )}

      <AdminList
        title="Transactions"
        subtitle="Review payment records created by the backend."
        icon={<CreditCard className="size-6" />}
        loading={loading}
        q={q}
        setQ={setQ}
        count={shown.length}
        empty={shown.length === 0}
        emptyMessage={
          items.length === 0
            ? "No payment records are available. A payment provider integration must create trusted transaction records."
            : "No transactions match your search or selected payment status."
        }
        filters={
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        }
      >
        {shown.map((item) => (
          <Card
            key={item._id}
            className="border-border/70 shadow-sm transition-colors hover:border-primary/30"
          >
            <CardContent className="space-y-4 p-4 sm:p-5">
              {/* TRANSACTION HEADER */}

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Receipt className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-all text-sm font-semibold">
                      {item.transactionId || item._id}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Transaction ID
                    </p>
                  </div>
                </div>

                <StatusBadge
                  status={item.paymentStatus || item.status || "Unknown"}
                />
              </div>

              <div className="h-px bg-border/70" />

              {/* TRANSACTION DETAILS */}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Appointment ID
                  </p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {item.appointmentId || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CircleDollarSign className="size-3.5" />
                    Amount
                  </div>

                  <p className="mt-1 text-sm font-semibold">
                    {item.amount ?? "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Payment Method
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize">
                    {item.paymentMethod || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Transaction Date
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {stamp(item.transactionDate || item.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </AdminList>
    </div>
  );
}
