"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CalendarDays,
  Ban,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  UserRound,
  Trash2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

type DashboardOverview = {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  blockedUsers: number;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string | null;
};

type AppointmentCustomer = {
  name: string;
  email: string;
  image: string | null;
};

type AdminAppointment = {
  _id: string;
  serviceId: string;
  customerId: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  additionalMessage: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customer: AppointmentCustomer;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

// --------------------------------------------------
// API HELPERS
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

// --------------------------------------------------
// FORMATTERS
// --------------------------------------------------

function formatDate(date: string | null | undefined) {
  if (!date) return "—";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string | null | undefined) {
  if (!time) return "—";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return time;
  }

  const formattedHour = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";

  return `${formattedHour}:${String(minute).padStart(2, "0")} ${period}`;
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
// DASHBOARD
// --------------------------------------------------

export default function AdminDashboardClient() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Appointment search + filter
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatus, setAppointmentStatus] = useState("all");

  // Delete history dialogs
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<AdminAppointment | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // ------------------------------------------------
  // LOAD ADMIN DATA
  // ------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [overviewResult, appointmentsResult, usersResult] =
          await Promise.all([
            requestJson<DashboardOverview>("/api/admin/overview", {
              method: "GET",
              cache: "no-store",
            }),

            requestJson<AdminAppointment[]>("/api/admin/appointments", {
              method: "GET",
              cache: "no-store",
            }),

            requestJson<AdminUser[]>("/api/admin/users", {
              method: "GET",
              cache: "no-store",
            }),
          ]);

        if (!active) return;

        setOverview(overviewResult.data);
        setAppointments(appointmentsResult.data);
        setUsers(usersResult.data);
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

  // ------------------------------------------------
  // REFRESH
  // ------------------------------------------------

  function handleRefresh() {
    setRefreshing(true);
    setNotice(null);
    setError(null);
    setRefreshKey((current) => current + 1);
  }

  // ------------------------------------------------
  // UPDATE APPOINTMENT STATUS
  // ------------------------------------------------

  async function handleAppointmentStatus(
    appointmentId: string,
    status: "Confirmed" | "Cancelled",
  ) {
    const actionId = `appointment-${appointmentId}`;

    try {
      setBusyId(actionId);
      setError(null);
      setNotice(null);

      await requestJson(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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

  // ------------------------------------------------
  // DELETE CANCELLED APPOINTMENT HISTORY
  // ------------------------------------------------

  async function handleDeleteHistory() {
    if (!appointmentToDelete || busyId !== null) return;

    const appointmentId = appointmentToDelete._id;

    try {
      setBusyId(`delete-${appointmentId}`);
      setError(null);
      setNotice(null);

      await requestJson(`/api/appointments/admin/${appointmentId}/history`, {
        method: "DELETE",
      });

      setAppointmentToDelete(null);
      setNotice("Appointment history deleted successfully.");
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setAppointmentToDelete(null);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete appointment history.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteAllHistory() {
    if (cancelledCount === 0 || busyId !== null) return;

    try {
      setBusyId("delete-all");
      setError(null);
      setNotice(null);

      const result = await requestJson(
        "/api/appointments/admin/history/cancelled",
        { method: "DELETE" },
      );

      setShowDeleteAllConfirm(false);
      setNotice(result.message || "All cancelled appointment history deleted.");
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setShowDeleteAllConfirm(false);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete appointment history.",
      );
    } finally {
      setBusyId(null);
    }
  }

  // ------------------------------------------------
  // BLOCK / UNBLOCK USER
  // ------------------------------------------------

  async function handleUserBlock(user: AdminUser) {
    const actionId = `user-${user._id}`;

    const endpoint = user.isBlocked
      ? `/api/admin/users/${user._id}/unblock`
      : `/api/admin/users/${user._id}/block`;

    try {
      setBusyId(actionId);
      setError(null);
      setNotice(null);

      await requestJson(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Blocked by SalonBook admin.",
        }),
      });

      setNotice(
        user.isBlocked
          ? `${user.name} has been unblocked.`
          : `${user.name} has been blocked.`,
      );

      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setBusyId(null);
    }
  }

  // ------------------------------------------------
  // FILTERS
  // ------------------------------------------------

  const filteredUsers = users.filter((user) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return true;

    return (
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue) ||
      user.role.toLowerCase().includes(searchValue)
    );
  });

  const blockedUsers = users.filter((user) => user.isBlocked);

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "Cancelled",
  ).length;

  const shownAppointments = useMemo(() => {
    const searchValue = appointmentSearch.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus =
        appointmentStatus === "all" ||
        String(appointment.status || "").toLowerCase() === appointmentStatus;

      const searchText = [
        appointment._id,
        appointment.serviceName,
        appointment.customer?.name,
        appointment.customer?.email,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchText.includes(searchValue);
    });
  }, [appointments, appointmentSearch, appointmentStatus]);

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------

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

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

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

      {/* OVERVIEW */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-5 text-primary" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered platform accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="size-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.confirmedAppointments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="size-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.cancelledAppointments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <CalendarDays className="size-5 text-primary" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalAppointments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total booking requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock3 className="size-5 text-amber-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.pendingAppointments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Ban className="size-5 text-red-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.blockedUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Restricted accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* APPOINTMENT MANAGEMENT */}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                Appointment Management
              </CardTitle>

              <CardDescription className="mt-1">
                View and manage customer booking requests.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {cancelledCount > 0 && (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                >
                  {busyId === "delete-all" ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete All History
                </button>
              )}

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {shownAppointments.length}{" "}
                {shownAppointments.length === 1 ? "result" : "results"}
              </span>
            </div>
          </div>

          {/* SEARCH AND STATUS FILTER */}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={appointmentSearch}
                onChange={(event) => setAppointmentSearch(event.target.value)}
                placeholder="Search by service, customer name, email or ID..."
                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <select
              value={appointmentStatus}
              onChange={(event) => setAppointmentStatus(event.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {shownAppointments.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarDays className="mx-auto mb-3 size-10 text-muted-foreground/50" />
              <p className="font-medium">No appointments found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {appointments.length === 0
                  ? "Customer bookings will appear here."
                  : "No appointments match your search or selected filter."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {shownAppointments.map((appointment) => {
                const actionId = `appointment-${appointment._id}`;
                const isBusy = busyId === actionId;
                const isDeleting = busyId === `delete-${appointment._id}`;

                return (
                  <div key={appointment._id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {appointment.serviceName || "Salon Service"}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Appointment ID: #{String(appointment._id).slice(-10)}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="size-4" />
                            {appointment.customer?.name || "Unknown User"}
                          </span>

                          {appointment.customer?.email && (
                            <span className="break-all">
                              {appointment.customer.email}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                          <span>
                            <span className="text-muted-foreground">
                              Date:{" "}
                            </span>
                            {formatDate(appointment.appointmentDate)}
                          </span>

                          <span>
                            <span className="text-muted-foreground">
                              Time:{" "}
                            </span>
                            {formatTime(appointment.timeSlot)}
                          </span>
                        </div>

                        {appointment.additionalMessage && (
                          <p className="mt-3 rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                            {appointment.additionalMessage}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>

                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                          {appointment.paymentStatus || "Unpaid"}
                        </span>
                      </div>
                    </div>

                    {appointment.status === "Pending" && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            handleAppointmentStatus(
                              appointment._id,
                              "Confirmed",
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 className="size-4" />
                          {isBusy ? "Updating..." : "Confirm"}
                        </button>

                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            handleAppointmentStatus(
                              appointment._id,
                              "Cancelled",
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                        >
                          <XCircle className="size-4" />
                          Cancel
                        </button>
                      </div>
                    )}

                    {appointment.status === "Cancelled" && (
                      <div className="mt-4 flex justify-end border-t pt-4">
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => setAppointmentToDelete(appointment)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                        >
                          {isDeleting ? (
                            <RefreshCw className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          Delete History
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* USER MANAGEMENT */}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                User Management
              </CardTitle>

              <CardDescription className="mt-1">
                Manage registered users and blocked accounts.
              </CardDescription>
            </div>

            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {users.length} users loaded
            </span>
          </div>

          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or role..."
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto mb-3 size-10 text-muted-foreground/50" />
              <p className="font-medium">No users found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another search.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredUsers.map((user) => {
                const actionId = `user-${user._id}`;
                const isBusy = busyId === actionId;
                const isAdmin = user.role === "admin";

                return (
                  <div
                    key={user._id}
                    className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt={user.name}
                          className="size-11 shrink-0 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                          <UserRound className="size-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold">{user.name}</p>

                        <p className="truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                            {user.role}
                          </span>

                          {user.isBlocked && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                              Blocked
                            </span>
                          )}

                          {isAdmin && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Protected Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {!isAdmin && (
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => handleUserBlock(user)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isBlocked
                              ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950"
                              : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                          }`}
                        >
                          {isBusy
                            ? "Updating..."
                            : user.isBlocked
                              ? "Unblock User"
                              : "Block User"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BLOCKED USERS SUMMARY */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="size-5 text-red-500" />
            Blocked Users
          </CardTitle>

          <CardDescription>
            Accounts currently restricted from accessing SalonBook.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {blockedUsers.length === 0 ? (
            <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
              <CheckCircle2 className="size-5 text-emerald-500" />
              No blocked users.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {blockedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                    Blocked
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADMIN NOTES */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-primary" />
            Admin Notes
          </CardTitle>

          <CardDescription>
            Platform security and administration.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Admin privileges are assigned only through the server-side{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              npm run make-admin
            </code>{" "}
            command.
          </p>

          <p>
            Admin APIs are protected by server-side authentication and role
            verification. Public sign-up cannot create an admin account.
          </p>

          <p>
            Blocked users are denied access by the Express authentication
            middleware using the database&apos;s{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              isBlocked
            </code>{" "}
            field.
          </p>
        </CardContent>
      </Card>

      {/* DELETE ONE HISTORY CONFIRMATION */}

      <AlertDialog
        open={!!appointmentToDelete}
        onOpenChange={(open) => {
          if (!open && busyId === null) setAppointmentToDelete(null);
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
              {appointmentToDelete?.customer?.name
                ? ` (${appointmentToDelete.customer.name})`
                : ""}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>
              Keep History
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={busyId !== null}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteHistory();
              }}
            >
              {busyId?.startsWith("delete-") ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE ALL HISTORY CONFIRMATION */}

      <AlertDialog
        open={showDeleteAllConfirm}
        onOpenChange={(open) => {
          if (busyId === null) setShowDeleteAllConfirm(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all appointment history?</AlertDialogTitle>

            <AlertDialogDescription>
              Permanently delete all{" "}
              <span className="font-semibold text-foreground">
                {cancelledCount} cancelled appointment records
              </span>{" "}
              of ALL customers? Pending and Confirmed appointments will not be
              affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>
              Keep History
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={busyId !== null || cancelledCount === 0}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteAllHistory();
              }}
            >
              {busyId === "delete-all" ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
