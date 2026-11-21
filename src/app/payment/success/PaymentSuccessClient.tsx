"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { apiFetch } from "@/lib/api-fetch";

type SessionResponse = {
  success: boolean;
  message?: string;
  data: {
    paymentStatus: string;
    appointmentPaymentStatus: string | null;
  };
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10;

export default function PaymentSuccessClient() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);
  const [stripePaid, setStripePaid] = useState(false);
  const [pollDone, setPollDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("session_id");

        if (!id) {
          setError(true);
          setChecking(false);
          return;
        }

        setSessionId(id);
        setChecking(true);

        let polls = 0;

        async function poll(currentId: string) {
          if (!active) return;
          polls += 1;

          try {
            const response = await apiFetch(
              `/api/payments/session/${encodeURIComponent(currentId)}`,
              { method: "GET", cache: "no-store" },
            );
            const result = (await response.json()) as SessionResponse;

            if (result.data?.appointmentPaymentStatus === "Paid") {
              setPaid(true);
              setChecking(false);
              setPollDone(true);
              return;
            }

            setStripePaid(!!result.data && result.data.paymentStatus === "paid");

            if (polls >= MAX_POLLS) {
              setChecking(false);
              setPollDone(true);
              return;
            }

            setTimeout(() => poll(currentId), POLL_INTERVAL_MS);
          } catch {
            setChecking(false);
            setPollDone(true);
            setError(true);
          }
        }

        void poll(id);
      } catch {
        setError(true);
        setChecking(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  function handleRetry() {
    setChecking(true);
    setPaid(false);
    setPollDone(false);
    setError(false);
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-red-500" />
            We could not confirm your payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We were unable to verify your payment session. Please try again or
            contact support.
          </p>
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
          >
            <RefreshCw className="size-4" /> Back to My Appointments
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (checking) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Confirming your payment...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            Payment confirmed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your payment has been confirmed. Your appointment is now marked as
            paid.
          </p>
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-900"
          >
            <RefreshCw className="size-4" /> Go to My Appointments
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (stripePaid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-amber-500" />
            Payment received
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your payment was received. Your appointment will update shortly.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
          >
            <RefreshCw className="size-4" /> Refresh
          </button>
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-primary hover:bg-muted ml-2"
          >
            Go to My Appointments
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Polling ended without confirmation
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="size-5 text-red-500" />
          We could not confirm your payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          We were unable to confirm your payment within the expected time.
          Please check your dashboard or try again.
        </p>
        <Link
          href="/dashboard/customer"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
        >
          <RefreshCw className="size-4" /> Back to My Appointments
        </Link>
      </CardContent>
    </Card>
  );
}
