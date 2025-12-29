import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-900">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mb-12 md:mb-20">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1 xl:col-span-2">
            <div className="mb-2">
              <span className="font-bold text-xl text-gray-900">
                Service<span className="text-red-600">4</span>Me
              </span>
            </div>
            <p className="text-gray-600 mb-5 max-w-[280px] sm:max-w-[320px] text-[14.5px]">
              Connecting clients with talented hairstylists. Discover, book, and review the best hair services in your
              area.
            </p>
            <div className="flex space-x-4 mb-4">
              <Link href="#" className="text-gray-500 hover:text-gray-900">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-600 mb-4 text-[14.5px]">
              {["Braids", "Wigs", "Locs", "Natural Hair", "Silk Press", "Bridal Hair"].map((category) => (
                <li key={category}>
                  <Link href={`/browse?category=${encodeURIComponent(category)}`} className="hover:text-gray-900">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-semibold mb-4">Locations</h3>
            <ul className="space-y-2 text-gray-600 mb-4 text-[14.5px]">
              <li>
                <Link href="/browse?location=North London" className="hover:text-gray-900">
                  North London
                </Link>
              </li>
              <li>
                <Link href="/browse?location=East London" className="hover:text-gray-900">
                  East London
                </Link>
              </li>
              <li>
                <Link href="/browse?location=South London" className="hover:text-gray-900">
                  South London
                </Link>
              </li>
              <li>
                <Link href="/browse?location=West London" className="hover:text-gray-900">
                  West London
                </Link>
              </li>
              <li>
                <Link href="/browse?location=Central London" className="hover:text-gray-900">
                  Central London
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-600 mb-4 text-[14.5px]">
              <li>
                <Link href="/for-business" className="hover:text-gray-900">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">© 2026 Service4Me. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
              Terms of Service
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-gray-900 text-sm">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
