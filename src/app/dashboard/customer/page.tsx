
import type { Metadata } from "next";
import CustomerDashboardClient from "@/app/dashboard/customer/CustomerDashboardClient";

export const metadata: Metadata = {
  title: "Customer Dashboard — SalonBook",
  description: "Manage your SalonBook appointments and payments.",
};

export default function CustomerDashboardPage() {
  return <CustomerDashboardClient />;
}
