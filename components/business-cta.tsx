"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function BusinessCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-12 h-12 text-red-200" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your hair styling business?
          </h2>

          <p className="text-red-100 mb-8 text-lg">
            Join hundreds of successful stylists who’ve grown their business with Service4Me. Start your free trial
            today and see the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 font-medium px-8 py-4">
                Sign Up Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
