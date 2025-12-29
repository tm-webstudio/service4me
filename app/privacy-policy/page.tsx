import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none space-y-5">
          <p className="text-gray-500 text-sm">Last updated: December 2025</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Information We Collect</h2>
            <p className="text-gray-600 text-sm">
              We collect information you provide when creating an account, including your name, email address, and phone number. For stylists, we also collect business information, portfolio images, and service details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">How We Use Your Information</h2>
            <p className="text-gray-600 text-sm">
              Your information is used to provide our services, connect clients with stylists, process bookings, and improve your experience on our platform. We may also send service-related communications.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Data Protection</h2>
            <p className="text-gray-600 text-sm">
              We implement appropriate security measures to protect your personal information. Your data is stored securely and we do not sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Cookies</h2>
            <p className="text-gray-600 text-sm">
              We use cookies to enhance your browsing experience and analyse site traffic. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Your Rights</h2>
            <p className="text-gray-600 text-sm">
              You have the right to access, update, or delete your personal information at any time. Contact us at support@service4me.co.uk for any privacy-related requests.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
