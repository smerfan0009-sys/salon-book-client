import type { Metadata } from "next";
import { Scissors, LayoutDashboard, Calendar } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const instant = false;

export const metadata: Metadata = {
  title: "Customer Dashboard — SalonBook",
  description: "Your salon appointments and profile.",
};

export default function CustomerDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <LayoutDashboard className="size-7 text-primary" />
          Customer Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          Welcome back! Manage your salon appointments here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            My Appointments
          </CardTitle>

          <CardDescription>
            View and manage your upcoming and past appointments.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your appointments will appear here.
          </p>
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

        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Browse services and book new salon appointments.</p>
          <p>Manage your profile and password from account settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
