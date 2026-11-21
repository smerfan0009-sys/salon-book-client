
import type { Metadata } from "next";
import Link from "next/link";

import { XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Cancelled — SalonBook",
  description: "Your SalonBook payment was cancelled.",
};

export default function PaymentCancelPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="size-5 text-red-500" />
          Payment cancelled
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          No payment was made. Your appointment is still confirmed and you can
          pay anytime.
        </p>
        <Link
          href="/dashboard/customer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-900"
        >
          Go to My Appointments
        </Link>
      </CardContent>
    </Card>
  );
}
