"use client"

import { Navigation } from '@/components/navigation'
import { SignupForm } from '@/components/auth/signup-form'
import { Footer } from '@/components/footer'
import { PublicRoute } from '@/lib/auth'

export default function SignupPage() {
  return (
      <PublicRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <SignupForm />
          <Footer />
        </div>
      </PublicRoute>
  )
}
