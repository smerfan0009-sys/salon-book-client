import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | SalonBook",
  description:
    "Read the terms and conditions for using the SalonBook appointment booking platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using SalonBook, you agree to follow these Terms of Service and any applicable laws and regulations. If you do not agree with these terms, please discontinue using the platform.",
  },
  {
    title: "2. About SalonBook",
    content:
      "SalonBook is an online platform designed to help customers discover salon services and manage appointments. The services, prices, availability, and other details displayed on the platform may be updated from time to time.",
  },
  {
    title: "3. User Accounts",
    content: "When creating and using an account, you agree to:",
    items: [
      "Provide accurate and up-to-date account information.",
      "Keep your login credentials confidential.",
      "Use your own account and not impersonate another person.",
      "Notify the platform administrator if you suspect unauthorized account access.",
      "Take responsibility for activities performed through your account, subject to applicable law.",
    ],
  },
  {
    title: "4. Appointment Booking",
    content:
      "Customers can use SalonBook to request and manage salon appointments. When making a booking, you are responsible for selecting the correct service, date, and available time.",
    items: [
      "A booking request is subject to service and time-slot availability.",
      "An appointment should be considered confirmed only when its status is shown as confirmed or you receive an appropriate confirmation.",
      "Appointment details may be updated if availability or service information changes.",
      "Please review your appointment details before completing a booking.",
    ],
  },
  {
    title: "5. Cancellation and Rescheduling",
    content:
      "Appointment cancellation and rescheduling options depend on the functionality available in SalonBook and the applicable salon policies. Please use the available appointment management options or contact the salon for assistance. Any applicable cancellation conditions, fees, or refund rules should be communicated before they apply.",
  },
  {
    title: "6. Services and Pricing",
    content:
      "Service descriptions, estimated durations, prices, and availability are provided for informational and booking purposes. Prices and service details may change. The information displayed at the time of booking should be reviewed before confirming an appointment. Actual service delivery is the responsibility of the relevant salon or service provider.",
  },
  {
    title: "7. Payments and Refunds",
    content:
      "Any applicable payment requirements, payment methods, charges, and refund conditions will depend on the payment arrangements offered for a particular service. Please review the payment instructions provided during booking or by the relevant service provider. Refunds are subject to the applicable payment and cancellation terms.",
  },
  {
    title: "8. Acceptable Use",
    content: "When using SalonBook, you must not:",
    items: [
      "Provide false, misleading, or fraudulent information.",
      "Attempt to access another user's account without authorization.",
      "Interfere with the security or normal operation of the platform.",
      "Use automated tools to abuse booking functionality or overload the service.",
      "Upload or transmit malicious code or content.",
      "Use the platform for unlawful or unauthorized purposes.",
    ],
  },
  {
    title: "9. Platform Availability",
    content:
      "We aim to keep SalonBook available and functioning properly. However, uninterrupted access cannot be guaranteed. Maintenance, technical issues, internet disruptions, or circumstances outside our control may temporarily affect the platform.",
  },
  {
    title: "10. Third-Party Services",
    content:
      "SalonBook may provide links to or integrations with third-party websites and services. These third parties operate independently and may have separate terms and privacy policies. SalonBook is not responsible for the content, policies, or services of independent third parties.",
  },
  {
    title: "11. Intellectual Property",
    content:
      "Unless otherwise stated, the SalonBook name, branding, website design, interface elements, and original platform content are protected by applicable intellectual property laws. You may not copy, reproduce, distribute, or commercially exploit protected content without appropriate permission.",
  },
  {
    title: "12. Limitation of Liability",
    content:
      "To the extent permitted by applicable law, SalonBook is not responsible for indirect or consequential losses arising from temporary service interruptions, inaccurate information supplied by users or service providers, or the independent actions of third parties. Nothing in these terms excludes liability that cannot legally be excluded.",
  },
  {
    title: "13. Account Suspension or Termination",
    content:
      "We may restrict or suspend access to an account when there is reasonable evidence of misuse, security risks, fraudulent activity, or a violation of these terms. Where appropriate, we will provide information about the reason for the restriction.",
  },
  {
    title: "14. Changes to These Terms",
    content:
      "We may revise these Terms of Service when platform features, services, or legal requirements change. Updated terms will be published on this page with a revised effective date. Continued use of SalonBook after an update constitutes acknowledgment of the updated terms, to the extent permitted by law.",
  },
  {
    title: "15. Governing Law",
    content:
      "These terms are subject to the applicable laws and regulations governing the use of the platform. Any disputes will be handled in accordance with applicable legal requirements.",
  },
];

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-yellow-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Heading */}
        <header className="mb-12 border-b border-amber-400/20 pb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300">
            <FileText className="h-4 w-4" />
            Platform Guidelines
          </div>

          <h1 className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Please read these terms carefully before using SalonBook. They
            explain the rules, responsibilities, and conditions associated with
            using our appointment booking platform.
          </p>

          <p className="mt-5 text-sm text-zinc-500">
            Effective date: November 22, 2026
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-10 rounded-2xl border border-amber-400/15 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="mb-3 text-lg font-semibold text-amber-300">
            Welcome to SalonBook
          </h2>

          <p className="text-sm leading-7 text-zinc-400">
            These Terms of Service govern your access to and use of the
            SalonBook website and its appointment booking features. By using the
            platform, you agree to these terms.
          </p>
        </section>

        {/* Terms sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-b border-white/10 pb-8 last:border-0"
            >
              <h2 className="mb-4 text-xl font-semibold text-white">
                {section.title}
              </h2>

              <p className="text-sm leading-7 text-zinc-400">
                {section.content}
              </p>

              {section.items && (
                <ul className="mt-4 space-y-3 pl-1">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-7 text-zinc-400"
                    >
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Contact */}
        <section className="mt-8 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.08] to-transparent p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white">
            Questions About These Terms?
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            For questions, concerns, or assistance regarding these Terms of
            Service, contact the SalonBook team.
          </p>

          <a
            href="mailto:smerfan0009@gmail.com"
            className="mt-4 inline-block text-sm font-medium text-amber-300 transition-colors hover:text-amber-200"
          >
            smerfan0009@gmail.com
          </a>
        </section>

        {/* Footer */}
        <div className="mt-12 border-t border-amber-400/15 pt-6 text-center">
          <p className="text-xs text-zinc-500">
            &copy; 2026 SalonBook. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
