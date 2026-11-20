import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import Navbar from "@/components/sections/Navbar";

export const metadata: Metadata = {
  title: "SalonBook",
  description: "Salon Appointment Booking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div className="h-[76px]" aria-hidden="true" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
