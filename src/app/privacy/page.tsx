import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SalonBook",
  description:
    "Learn how SalonBook collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "When you use SalonBook, we may collect information that you provide directly, including:",
    items: [
      "Account information, such as your name, email address, and phone number when requested.",
      "Appointment information, including selected services, preferred dates, times, booking status, and related details.",
      "Communication information when you contact us for assistance or support.",
      "Payment-related information or transaction references when payment features are available.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: "We use collected information to:",
    items: [
      "Create and manage your customer account.",
      "Process, confirm, update, and manage appointments.",
      "Communicate important booking updates and service-related information.",
      "Respond to questions and provide customer support.",
      "Maintain platform security and prevent unauthorized activity.",
      "Improve the functionality and reliability of SalonBook.",
      "Comply with applicable legal obligations.",
    ],
  },
  {
    title: "3. Sharing Your Information",
    content:
      "We do not sell your personal information. We may share relevant information only when reasonably necessary:",
    items: [
      "With salon administrators and relevant service providers to manage your appointments.",
      "With hosting, database, authentication, email, or other technology providers that support the platform.",
      "When required by applicable law, legal processes, or valid government requests.",
      "When necessary to protect the rights, safety, and security of users or SalonBook.",
    ],
  },
  {
    title: "4. Payments",
    content:
      "Payment options and procedures may vary depending on the services available through SalonBook. When a third-party payment provider is used, payment information may be processed under that provider's own privacy policy and terms. We do not control the privacy practices of independent payment providers.",
  },
  {
    title: "5. Data Storage and Retention",
    content:
      "We retain personal information for as long as reasonably necessary to provide our services, manage appointments, maintain business records, resolve disputes, and meet applicable legal obligations. Retention periods may vary depending on the type of information and its purpose.",
  },
  {
    title: "6. Data Security",
    content:
      "We take reasonable measures to protect information handled through SalonBook against unauthorized access, loss, misuse, or alteration. However, no internet-based system or electronic storage method can be guaranteed to be completely secure.",
  },
  {
    title: "7. Your Privacy Rights",
    content:
      "Depending on applicable law, you may have the right to request access to, correction of, or deletion of your personal information. You may contact us using the email address below to submit a privacy-related request. We may need to verify your identity before processing certain requests.",
  },
  {
    title: "8. Third-Party Services and Links",
    content:
      "SalonBook may contain links to external websites or use third-party services. These services operate independently and may have their own privacy policies. We encourage you to review their policies before providing personal information.",
  },
  {
    title: "9. Children's Privacy",
    content:
      "SalonBook is not intended to knowingly collect personal information from children without appropriate authorization. If you believe a child has provided personal information without the necessary consent, please contact us so that the matter can be reviewed.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy when our services or privacy practices change. Any updated version will be published on this page with a revised effective date. Your continued use of SalonBook after an update means you acknowledge the revised policy.",
  },
];

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="h-4 w-4" />
            Your Privacy Matters
          </div>

          <h1 className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Your privacy is important to us. This policy explains what
            information SalonBook may collect, how we use it, and the steps we
            take to protect your information when you use our platform.
          </p>

          <p className="mt-5 text-sm text-zinc-500">
            Effective date: November 22, 2026
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-10 rounded-2xl border border-amber-400/15 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="mb-3 text-lg font-semibold text-amber-300">
            Introduction
          </h2>

          <p className="text-sm leading-7 text-zinc-400">
            SalonBook is an online salon appointment booking platform. By
            accessing or using our website, you acknowledge that your
            information may be handled as described in this Privacy Policy.
            Please read this policy carefully to understand our privacy
            practices.
          </p>
        </section>

        {/* Policy sections */}
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
          <h2 className="text-xl font-semibold text-white">Contact Us</h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Have questions about this Privacy Policy or how your personal
            information is handled? Contact our team.
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
