"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

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
  Eye,
  XCircle,
  Tag,
  Trash2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

import { apiFetch } from "@/lib/api-fetch";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface ServiceInfo {
  image?: string;
  imageUrl?: string;
  category?: string;
  price?: number | string;
}

interface Service {
  _id: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  price?: number | string;
}

interface Appointment {
  _id: string;
  customerId: string;
  serviceId: string;
  serviceName: string;

  serviceImage?: string;
  serviceCategory?: string;
  servicePrice?: number | string;
  service?: ServiceInfo;

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
  // Fetch appointments
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

  // Fetch services separately
  // Appointment loading should still work if services fail
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

  return {
    appointments,
    services,
  };
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatDate(date: string) {
  if (!date) return "N/A";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRequestDate(date: string) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "N/A";

  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function formatPrice(price?: number | string) {
  if (price === undefined || price === null || price === "") {
    return null;
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return `৳${numericPrice.toLocaleString("en-BD")}`;
}

// Find corresponding service using serviceId
function findAppointmentService(appointment: Appointment, services: Service[]) {
  return services.find(
    (service) => String(service._id) === String(appointment.serviceId),
  );
}

function getServiceImage(appointment: Appointment, service?: Service) {
  return (
    appointment.serviceImage ||
    appointment.service?.image ||
    appointment.service?.imageUrl ||
    service?.image ||
    service?.imageUrl ||
    ""
  );
}

function getServiceCategory(appointment: Appointment, service?: Service) {
  return (
    appointment.serviceCategory ||
    appointment.service?.category ||
    service?.category ||
    ""
  );
}

function getServicePrice(appointment: Appointment, service?: Service) {
  return formatPrice(
    appointment.servicePrice ?? appointment.service?.price ?? service?.price,
  );
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

function getPaymentStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "text-green-600 dark:text-green-400";

    case "failed":
      return "text-red-600 dark:text-red-400";

    default:
      return "text-amber-600 dark:text-amber-400";
  }
}

// --------------------------------------------------
// SERVICE IMAGE COMPONENT
// --------------------------------------------------

function ServiceImage({ src, alt }: { src: string; alt: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-36">
      {src && !imageFailed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Scissors className="size-9 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function CustomerDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------
  // ACTION STATES
  // --------------------------------------------------

  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
  // INITIAL DATA FETCH
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const result = await fetchCustomerDashboardData();

        if (!cancelled) {
          setAppointments(result.appointments);
          setServices(result.services);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Customer dashboard error:", err);

          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // REFRESH APPOINTMENTS AND SERVICES
  // --------------------------------------------------

  const fetchAppointments = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await fetchCustomerDashboardData();

      setAppointments(result.appointments);
      setServices(result.services);
    } catch (err) {
      console.error("Customer appointments error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading appointments.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // --------------------------------------------------
  // DELETE ONE CANCELLED APPOINTMENT HISTORY
  // --------------------------------------------------

  const handleDeleteAppointmentHistory = async () => {
    if (!appointmentToDelete || deletingId || deletingAllHistory) {
      return;
    }

    const appointmentId = appointmentToDelete._id;

    try {
      setDeletingId(appointmentId);

      const response = await apiFetch(
        `/api/appointments/${appointmentId}/history`,
        {
          method: "DELETE",
        },
      );

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Failed to delete appointment history.",
        );
      }

      // Update appointment list
      setAppointments((current) =>
        current.filter((item) => item._id !== appointmentId),
      );

      // Close confirmation dialog
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

  const handleDeleteAllAppointmentHistory = async () => {
    if (cancelledAppointments === 0 || deletingId || deletingAllHistory) {
      return;
    }

    try {
      setDeletingAllHistory(true);

      const response = await apiFetch("/api/appointments/history/cancelled", {
        method: "DELETE",
      });

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Failed to delete appointment history.",
        );
      }

      // Remove cancelled appointments from UI
      setAppointments((current) =>
        current.filter((appointment) => appointment.status !== "Cancelled"),
      );

      // Close confirmation dialog
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
  // OPEN CANCEL CONFIRMATION DIALOG
  // --------------------------------------------------

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
  };

  // --------------------------------------------------
  // CONFIRM APPOINTMENT CANCELLATION
  // --------------------------------------------------

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel || cancellingId) return;

    const appointmentId = appointmentToCancel._id;

    setCancellingId(appointmentId);

    try {
      const response = await apiFetch(
        `/api/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
        },
      );

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "Failed to cancel appointment.");
      }

      // Close confirmation dialog
      setAppointmentToCancel(null);

      toast.success("Appointment cancelled successfully.");

      // Refresh appointment list and statistics
      await fetchAppointments(false);
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

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending",
  ).length;

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed",
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "Cancelled",
  ).length;

  // --------------------------------------------------
  // ACTION STATUS
  // --------------------------------------------------

  const isAnyActionRunning =
    !!cancellingId || !!deletingId || deletingAllHistory;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

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

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/customer/appointments"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          My Appointments
        </Link>

        <Link
          href="/dashboard/customer/profile"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          My Profile
        </Link>
      </div>

      {/* Appointment Statistics */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : cancelledAppointments}
              </p>
            </div>

            <XCircle className="size-8 text-red-500" />
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
              View and manage your salon appointment requests.
            </CardDescription>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* DELETE ALL HISTORY BUTTON */}

            {cancelledAppointments > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                onClick={() => setShowDeleteAllConfirm(true)}
                disabled={isAnyActionRunning || loading}
              >
                {deletingAllHistory ? (
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Delete All History
              </Button>
            )}

            {/* REFRESH BUTTON */}

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void fetchAppointments()}
              disabled={loading || isAnyActionRunning}
              aria-label="Refresh appointments"
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading */}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="size-10 text-destructive" />

              <p className="text-sm text-destructive">{error}</p>

              <Button
                type="button"
                onClick={() => void fetchAppointments()}
                disabled={isAnyActionRunning}
              >
                Try Again
              </Button>
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

              <Button className="mt-2">
                <Link href="/services">
                  Explore Services
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          )}

          {/* Appointment List */}

          {!loading && !error && appointments.length > 0 && (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const matchedService = findAppointmentService(
                  appointment,
                  services,
                );

                const serviceImage = getServiceImage(
                  appointment,
                  matchedService,
                );

                const serviceCategory = getServiceCategory(
                  appointment,
                  matchedService,
                );

                const servicePrice = getServicePrice(
                  appointment,
                  matchedService,
                );

                const isPending = appointment.status === "Pending";
                const isCancelling = cancellingId === appointment._id;
                const isCancelled = appointment.status === "Cancelled";
                const isDeleting = deletingId === appointment._id;

                return (
                  <div
                    key={appointment._id}
                    className="rounded-xl border p-4 transition-colors hover:bg-muted/30 sm:p-5"
                  >
                    <div className="flex flex-col gap-5">
                      {/* DELETE HISTORY BUTTON */}

                      {isCancelled && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                            onClick={() => setAppointmentToDelete(appointment)}
                            disabled={isAnyActionRunning || loading}
                          >
                            {isDeleting ? (
                              <RefreshCw className="mr-2 size-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 size-4" />
                            )}
                            Delete History
                          </Button>
                        </div>
                      )}

                      {/* Service Information */}

                      <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Service Image */}

                        <ServiceImage
                          key={serviceImage || appointment._id}
                          src={serviceImage}
                          alt={appointment.serviceName}
                        />

                        {/* Service Details */}

                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {appointment.serviceName}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(appointment.status)}`}
                            >
                              {appointment.status}
                            </span>
                          </div>

                          {/* Category */}

                          {serviceCategory && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Tag className="size-4 text-primary" />
                              {serviceCategory}
                            </div>
                          )}

                          {/* Appointment Date & Time */}

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

                          {/* Service Price */}

                          {servicePrice && (
                            <p className="text-base font-semibold">
                              {servicePrice}
                            </p>
                          )}
                        </div>

                        {/* Appointment ID */}

                        <div className="shrink-0">
                          <span className="text-xs text-muted-foreground">
                            ID: {appointment._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Additional Message */}

                      {appointment.additionalMessage && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="mt-0.5 size-4 shrink-0" />

                          <p>{appointment.additionalMessage}</p>
                        </div>
                      )}

                      {/* Appointment Meta Information */}

                      <div className="flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground">
                          <p>
                            Requested:{" "}
                            <span className="font-medium text-foreground">
                              {formatRequestDate(appointment.createdAt)}
                            </span>
                          </p>

                          <p>
                            Payment:{" "}
                            <span
                              className={`font-medium ${getPaymentStatusStyle(appointment.paymentStatus)}`}
                            >
                              {appointment.paymentStatus || "Unpaid"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Appointment Actions */}

                      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                        {/* View Service Details */}

                        <Link
                          href={`/services/${appointment.serviceId}`}
                          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          <Eye className="size-4" />
                          View Details
                        </Link>

                        {/* Cancel: Pending Only */}

                        {isPending && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                            onClick={() => handleCancelAppointment(appointment)}
                            disabled={isAnyActionRunning || loading}
                          >
                            {isCancelling ? (
                              <RefreshCw className="mr-2 size-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 size-4" />
                            )}
                            Cancel Appointment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* ================================================== */}
      {/* CANCEL APPOINTMENT CONFIRMATION */}
      {/* ================================================== */}

      <AlertDialog
        open={!!appointmentToCancel}
        onOpenChange={(open) => {
          if (!cancellingId && !open) {
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
            <AlertDialogCancel disabled={!!cancellingId}>
              Keep Appointment
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={!!cancellingId}
              onClick={(event) => {
                event.preventDefault();
                void confirmCancelAppointment();
              }}
            >
              {cancellingId ? "Cancelling..." : "Yes, Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================== */}
      {/* DELETE ONE APPOINTMENT HISTORY CONFIRMATION */}
      {/* ================================================== */}

      <AlertDialog
        open={!!appointmentToDelete}
        onOpenChange={(open) => {
          if (!deletingId && !deletingAllHistory && !open) {
            setAppointmentToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appointment history?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to permanently delete the cancelled
              appointment for{" "}
              <span className="font-semibold text-foreground">
                {appointmentToDelete?.serviceName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>
              Keep History
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={!!deletingId || deletingAllHistory}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteAppointmentHistory();
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
                {cancelledAppointments} cancelled appointment history records
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
              disabled={deletingAllHistory || cancelledAppointments === 0}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteAllAppointmentHistory();
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
