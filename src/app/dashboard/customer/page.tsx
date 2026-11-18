import type { Metadata } from "next";
import { Scissors, LayoutDashboard, Calendar } from "lucide-react";

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
  title: "Customer Dashboard — SalonBook",
  description: "Your salon appointments and profile.",
};

export default function CustomerDashboardPage() {
  return (
    <RoleGate role="customer">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <LayoutDashboard className="size-7 text-primary" />
              Customer Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back! Manage your salon appointments here.
            </p>
          </div>
          <DashboardSignOut />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                My Appointments
              </CardTitle>
              <CardDescription>
                Your upcoming and past bookings will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                <Calendar className="mx-auto mb-2 size-8 text-muted-foreground/60" />
                No appointments yet. Browse services to book your first visit.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="size-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Everyday shortcuts.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Browse services and book appointments from the home page.</p>
              <p>Manage your profile and password from the account settings (coming soon).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGate>
  );
}
