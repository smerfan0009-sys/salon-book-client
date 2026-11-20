import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function CustomerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell role="customer">{children}</DashboardShell>;
}
