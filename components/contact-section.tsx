import Link from "next/link"
import { Mail, Facebook, Instagram, Twitter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ContactSection() {
  return (
    <section className="py-0">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 mt-3">
        <div className="relative rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 py-10 md:py-20 px-5 mb-6 mb-6x">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 max-w-xl mx-auto">
                Contact Us
              </h1>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                Have questions or need support? We're here to help. Reach out to us through any of the channels below.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="flex justify-center mb-12">
              {/* Email Card */}
              <Card className="border shadow-sm hover:shadow-sm transition-shadow max-w-md w-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-600 mb-4">Send us an email and we'll get back to you within 24 hours.</p>
                  <Link href="mailto:hello@service4me.com" className="text-red-600 hover:text-red-700 font-medium">
                    hello@service4me.com
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Social Media */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Follow Us</h3>
              <div className="flex justify-center space-x-6">
                <Link
                  href="#"
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-6 h-6 text-white" />
                </Link>
                <Link
                  href="#"
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </Link>
                <Link
                  href="#"
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-6 h-6 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
