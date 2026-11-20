import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell role="admin">{children}</DashboardShell>;
}
