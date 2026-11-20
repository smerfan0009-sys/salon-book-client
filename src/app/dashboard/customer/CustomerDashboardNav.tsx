"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarPlus } from "lucide-react";

const navigationItems = [
  {
    label: "Overview",
    href: "/dashboard/customer",
    icon: LayoutDashboard,
  },
  {
    label: "Book Appointment",
    href: "/services",
    icon: CalendarPlus,
  },
];

export default function CustomerDashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4">
      {/* Portal Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">SalonBook</h2>
        <p className="text-sm text-muted-foreground">Customer portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-wrap items-center gap-2 border-b pb-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
