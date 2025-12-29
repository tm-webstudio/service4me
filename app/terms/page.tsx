import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Terms of Service</h1>

        <div className="prose prose-gray max-w-none space-y-5">
          <p className="text-gray-500 text-sm">Last updated: December 2025</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Acceptance of Terms</h2>
            <p className="text-gray-600 text-sm">
              By accessing and using Service4Me, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Our Service</h2>
            <p className="text-gray-600 text-sm">
              Service4Me connects clients with hair stylists. We provide a platform for discovery and booking but are not responsible for the quality of services provided by individual stylists.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">User Accounts</h2>
            <p className="text-gray-600 text-sm">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Provide accurate information when creating your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Stylist Responsibilities</h2>
            <p className="text-gray-600 text-sm">
              Stylists must provide accurate business information, maintain professional standards, and honour bookings made through the platform. Misleading information may result in account suspension.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Bookings & Payments</h2>
            <p className="text-gray-600 text-sm">
              Bookings are made directly with stylists through their external booking links. Service4Me does not process payments or handle booking disputes between clients and stylists.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Contact</h2>
            <p className="text-gray-600 text-sm">
              For questions about these terms, contact us at support@service4me.co.uk.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
