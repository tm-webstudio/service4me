"use client"

import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/lib/auth"
import { StylistProfile } from "@/components/stylist-profile"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AlertTriangle } from "lucide-react"

export default function PendingPreviewPage() {
  const params = useParams()
  const stylistId = (params?.id as string) || ""

  if (!stylistId) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-lg border bg-white shadow-sm p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Stylist not found</h2>
            <p className="text-gray-600">We couldn’t load this pending stylist preview.</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-3">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-700" />
              <div>
                <p className="text-sm md:text-base font-medium">Pending stylist preview</p>
                <p className="text-sm text-yellow-700/90">Visible to admins only. Not live on the site.</p>
              </div>
            </div>
          </div>
          <StylistProfile stylistId={stylistId} hideInactiveBanner />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
