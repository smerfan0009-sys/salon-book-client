import type { Metadata } from "next";

import MyAppointmentsClient from "./MyAppointmentsClient";

export const metadata: Metadata = {
  title: "My Appointments — SalonBook",
  description: "Review your SalonBook appointments and payments.",
};

export default function MyAppointmentsPage() {
  return <MyAppointmentsClient />;
}
