import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail, MessageCircle } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Support</h1>

        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">How Can We Help?</h2>
            <p className="text-gray-600 text-sm">
              We're here to help you get the most out of Service4Me. Whether you're a client looking for your next stylist or a stylist wanting to grow your business, we've got you covered.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Email Support</p>
                  <a href="mailto:support@service4me.co.uk" className="text-red-600 hover:text-red-700 text-sm">
                    support@service4me.co.uk
                  </a>
                </div>
              </div>
              <p className="text-xs text-gray-500">We typically respond within 24-48 hours.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Frequently Asked Questions</h2>

            <div className="space-y-3">
              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">How do I book a stylist?</h3>
                <p className="text-gray-600 text-sm">
                  Browse our stylists, select one you like, and click the "Book Now" button on their profile. This will redirect you to their booking page.
                </p>
              </div>

              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">How do I list my business?</h3>
                <p className="text-gray-600 text-sm">
                  Click "List Your Business" in the navigation menu and complete the registration form. Your profile will be reviewed and approved within 24-48 hours.
                </p>
              </div>

              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">How do I update my stylist profile?</h3>
                <p className="text-gray-600 text-sm">
                  Log into your account and go to your dashboard. From there, you can edit your profile information, services, and portfolio images.
                </p>
              </div>

              <div className="pb-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">Is Service4Me free to use?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, browsing and booking stylists is completely free for clients. Stylist listing options and pricing can be found on our listing page.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
