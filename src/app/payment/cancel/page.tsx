import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  CalendarCheck,
  CircleHelp,
  LayoutDashboard,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Cancelled — SalonBook",
  description: "Your SalonBook payment was cancelled.",
};

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center px-4 py-10">
      <Card className="w-full overflow-hidden">
        {/* top accent line */}
        <div className="h-1.5 w-full bg-amber-500" />

        <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10">
          {/* ICON */}

          <div className="relative flex size-24 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-red-500/10" />
            <span className="absolute inset-3 rounded-full bg-red-500/10" />
            <XCircle className="relative size-14 text-red-500" />
          </div>

          {/* TITLE + TEXT */}

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Payment cancelled
            </h1>

            <p className="text-sm leading-relaxed text-muted-foreground">
              No payment was made and you have not been charged. Your
              appointment is still confirmed, and you can pay anytime from your
              appointments page.
            </p>
          </div>

          {/* INFO BOX */}

          <div className="flex w-full items-start gap-3 rounded-xl border bg-muted/30 p-4 text-left">
            <CircleHelp className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Changed your mind or the payment did not go through? Open{" "}
              <span className="font-medium text-foreground">
                My Appointments
              </span>{" "}
              and click{" "}
              <span className="font-medium text-foreground">Pay Now</span> to
              try again.
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/customer/appointments"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <CalendarCheck className="size-4" />
              Try Again
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/dashboard/customer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
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
