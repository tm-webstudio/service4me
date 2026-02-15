"use client"

import type { FC } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Marketing hero shown on /for-business
 */
const BusinessHero: FC = () => {
  return (
    <section className="py-0">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
        <div className="relative rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 py-10 md:py-20 px-5">
          <div className="grid grid-cols-1 items-center justify-center">
            <div className="text-center">
              {/* Heading */}
              <h1 className="max-w-xl mx-auto text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                The #1 Discovery Platform for Hairstylist
              </h1>

              {/* Copy */}
              <p className="max-w-xl mx-auto text-lg text-gray-600 mb-8">
                Simple, powerful and flexible platform to grow your hair styling business and connect with more clients.
              </p>

              {/* CTA */}
              <Link href="/signup" className="inline-block">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-4">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { BusinessHero }
export default BusinessHero
