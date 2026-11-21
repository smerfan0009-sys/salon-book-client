"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Circle,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { apiFetch } from "@/lib/api-fetch";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type SessionResponse = {
  success: boolean;
  message?: string;
  data: {
    paymentStatus: string;
    appointmentPaymentStatus: string | null;
  };
};

type View = "checking" | "paid" | "received" | "failed" | "missing";
type StepState = "done" | "active" | "pending";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10;

// --------------------------------------------------
// STEP ITEM
// --------------------------------------------------

function StepItem({ label, state }: { label: string; state: StepState }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      {state === "done" && (
        <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
      )}
      {state === "active" && (
        <Loader2 className="size-5 shrink-0 animate-spin text-amber-500" />
      )}
      {state === "pending" && (
        <Circle className="size-5 shrink-0 text-muted-foreground/50" />
      )}
      <span
        className={
          state === "pending" ? "text-muted-foreground" : "font-medium"
        }
      >
        {label}
      </span>
    </li>
  );
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<View>("checking");
  const [attempt, setAttempt] = useState(0);
  const [stripePaid, setStripePaid] = useState(false);
  const [runKey, setRunKey] = useState(0);

  // No session_id in the URL means "missing", derived during render.
  const view: View = sessionId ? status : "missing";

  useEffect(() => {
    if (!sessionId) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;

    async function poll(id: string) {
      if (!active) return;

      polls += 1;

      try {
        const response = await apiFetch(
          `/api/payments/session/${encodeURIComponent(id)}`,
          { method: "GET", cache: "no-store" },
        );
        const result = (await response
          .json()
          .catch(() => null)) as SessionResponse | null;

        if (!active) return;

        setAttempt(polls);

        if (!response.ok || !result?.success || !result.data) {
          setStatus("failed");
          return;
        }

        if (result.data.appointmentPaymentStatus === "Paid") {
          setStatus("paid");
          return;
        }

        const paidAtStripe = result.data.paymentStatus === "paid";
        setStripePaid(paidAtStripe);

        // Stripe itself says not paid: no point polling further.
        if (!paidAtStripe) {
          setStatus("failed");
          return;
        }

        if (polls >= MAX_POLLS) {
          setStatus("received");
          return;
        }

        timer = setTimeout(() => void poll(id), POLL_INTERVAL_MS);
      } catch {
        if (active) setStatus("failed");
      }
    }

    void poll(sessionId);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, runKey]);

  function handleRetry() {
    setStatus("checking");
    setAttempt(0);
    setStripePaid(false);
    setRunKey((current) => current + 1);
  }

  const progress = Math.min(100, Math.round((attempt / MAX_POLLS) * 100));

  // Timeline state per view
  const paymentStep: StepState =
    view === "checking" && !stripePaid
      ? "active"
      : view === "failed" || view === "missing"
        ? "pending"
        : "done";

  const appointmentStep: StepState =
    view === "paid"
      ? "done"
      : view === "checking" && stripePaid
        ? "active"
        : view === "received"
          ? "active"
          : "pending";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center px-4 py-10">
      <Card className="w-full overflow-hidden">
        {/* top accent line */}
        <div
          className={`h-1.5 w-full ${
            view === "paid"
              ? "bg-emerald-500"
              : view === "failed" || view === "missing"
                ? "bg-red-500"
                : "bg-amber-500"
          }`}
        />

        <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10">
          {/* ICON */}

          <div className="relative flex size-24 items-center justify-center">
            {view === "paid" && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <span className="absolute inset-2 rounded-full bg-emerald-500/10" />
                <CheckCircle2 className="relative size-14 text-emerald-500" />
              </>
            )}

            {view === "checking" && (
              <>
                <span className="absolute inset-0 animate-pulse rounded-full bg-amber-500/10" />
                <Loader2 className="relative size-12 animate-spin text-amber-500" />
              </>
            )}

            {view === "received" && (
              <>
                <span className="absolute inset-2 rounded-full bg-amber-500/10" />
                <CheckCircle2 className="relative size-14 text-amber-500" />
              </>
            )}

            {(view === "failed" || view === "missing") && (
              <>
                <span className="absolute inset-2 rounded-full bg-red-500/10" />
                {view === "missing" ? (
                  <AlertTriangle className="relative size-14 text-red-500" />
                ) : (
                  <XCircle className="relative size-14 text-red-500" />
                )}
              </>
            )}
          </div>

          {/* TITLE + TEXT */}

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {view === "paid" && "Payment confirmed"}
              {view === "checking" && "Confirming your payment"}
              {view === "received" && "Payment received"}
              {view === "failed" && "We could not confirm your payment"}
              {view === "missing" && "Payment session not found"}
            </h1>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {view === "paid" &&
                "Thank you! Your appointment is now marked as paid. We look forward to seeing you."}
              {view === "checking" &&
                "Please wait a moment while we verify your payment. Do not close this page."}
              {view === "received" &&
                "Your payment went through, but your appointment is still updating. This usually takes a few seconds."}
              {view === "failed" &&
                "No completed payment was found for this session. If money was deducted, it will show on your dashboard shortly or contact the salon."}
              {view === "missing" &&
                "This page needs a valid payment session. Please go back to your appointments and try again."}
            </p>
          </div>

          {/* PROGRESS (checking only) */}

          {view === "checking" && (
            <div className="w-full">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Check {Math.max(attempt, 1)} of {MAX_POLLS}
              </p>
            </div>
          )}

          {/* TIMELINE */}

          {(view === "checking" || view === "paid" || view === "received") && (
            <ul className="flex w-full flex-col gap-3 rounded-xl border bg-muted/30 p-4 text-left">
              <StepItem
                label="Payment completed at Stripe"
                state={paymentStep}
              />
              <StepItem
                label="Appointment marked as paid"
                state={appointmentStep}
              />
            </ul>
          )}

          {/* ACTIONS */}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            {view === "paid" && (
              <>
                <Link
                  href="/dashboard/customer/appointments"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <CalendarCheck className="size-4" />
                  View My Appointments
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/dashboard/customer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </>
            )}

            {view === "received" && (
              <>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <RefreshCw className="size-4" />
                  Refresh status
                </button>
                <Link
                  href="/dashboard/customer/appointments"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Go to My Appointments
                </Link>
              </>
            )}

            {(view === "failed" || view === "missing") && (
              <Link
                href="/dashboard/customer/appointments"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <CalendarCheck className="size-4" />
                Back to My Appointments
              </Link>
            )}
          </div>

          {/* FOOTER NOTE */}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Payments are processed securely by Stripe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
