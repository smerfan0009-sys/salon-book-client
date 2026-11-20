import CustomerDashboardPage from "../page";

// The customer dashboard already contains the complete, authenticated
// appointment list and guarded cancellation flow. Reuse it for this focused
// route so both views stay consistent with the same server-side API.
export default function CustomerAppointmentsPage() {
  return <CustomerDashboardPage />;
}
