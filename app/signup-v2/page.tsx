"use client"

import { Navigation } from '@/components/navigation'
import { SignupFormV2 } from '@/components/auth-v2/signup-form'
import { Footer } from '@/components/footer'
import { PublicRoute } from '@/lib/auth-v2'

export default function SignupV2Page() {
  return (
      <PublicRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <SignupFormV2 />
          <Footer />
        </div>
      </PublicRoute>
  )
}
