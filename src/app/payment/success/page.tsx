
import type { Metadata } from "next";
import { Suspense } from "react";

import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata: Metadata = {
  title: "Payment Success — SalonBook",
  description: "Confirm your SalonBook payment.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
