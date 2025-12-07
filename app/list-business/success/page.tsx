"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Mail, ArrowRight } from "lucide-react"

export default function ListBusinessSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="pt-10 pb-10 px-6 sm:px-10 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Application Submitted!
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-8">
              Thank you for listing your business. Your profile has been submitted for review.
            </p>

            {/* Status Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-amber-800 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Pending Verification</span>
              </div>
              <p className="text-sm text-amber-700">
                Our team will review your listing within 24-48 hours. You'll receive an email once your profile is approved.
              </p>
            </div>

            {/* What happens next */}
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</span>
                  <span>We'll review your business details and portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</span>
                  <span>Once approved, your profile will be visible to clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">3</span>
                  <span>Start receiving booking inquiries from potential clients</span>
                </li>
              </ul>
            </div>

            {/* Email notification */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
              <Mail className="w-4 h-4" />
              <span>Check your email for confirmation details</span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/dashboard/stylist" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
