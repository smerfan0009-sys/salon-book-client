import DashboardShell from "@/app/dashboard/dashboard-shell";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell role="admin">{children}</DashboardShell>;
}
