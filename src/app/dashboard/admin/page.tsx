import type { Metadata } from "next";
import { ShieldCheck, LayoutDashboard, Users, Calendar, Ban } from "lucide-react";

import RoleGate from "@/components/auth/role-gate";
import DashboardSignOut from "@/components/auth/dashboard-sign-out";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Dashboard — SalonBook",
  description: "Manage the SalonBook platform.",
};

export default function AdminDashboardPage() {
  return (
    <RoleGate role="admin">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <ShieldCheck className="size-7 text-primary" />
              Admin Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Platform overview and management.
            </p>
          </div>
          <DashboardSignOut />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                Users
              </CardTitle>
              <CardDescription>Manage accounts and roles.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              User administration will appear here.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Appointments
              </CardTitle>
              <CardDescription>Platform-wide bookings.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Appointment overview will appear here.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="size-5 text-primary" />
                Blocked Users
              </CardTitle>
              <CardDescription>Accounts blocked from the platform.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Blocked-user management will appear here.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="size-5 text-primary" />
              Admin Notes
            </CardTitle>
            <CardDescription>How admin access works.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Admin access is granted only via the server-side{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run make-admin</code>{" "}
            command. Public sign-up can never create an admin account.
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
