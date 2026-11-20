
import type { Metadata } from "next";
import AdminDashboardClient from "@/app/dashboard/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard — SalonBook",
  description: "Manage the SalonBook platform.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
