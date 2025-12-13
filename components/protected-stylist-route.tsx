"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Lock } from 'lucide-react'

interface ProtectedStylistRouteProps {
  children: React.ReactNode
}

export function ProtectedStylistRoute({ children }: ProtectedStylistRouteProps) {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()

  // Check role from userProfile OR user_metadata as fallback
  const isStylist = userProfile?.role === 'stylist' || user?.user_metadata?.role === 'stylist'
  const role = userProfile?.role || user?.user_metadata?.role

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-lg border bg-white shadow-sm p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stylist Dashboard Locked</h2>
          <p className="text-gray-600 mb-6">Sign in to access your stylist dashboard.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/login?redirect=/dashboard/stylist')}
              className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isStylist) {
    const redirectPath = role === 'admin' ? '/admin' : '/dashboard/client'
    const roleLabel = role === 'admin' ? 'Admin dashboard' : 'Client dashboard'

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-lg border bg-white shadow-sm p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stylists Only</h2>
          <p className="text-gray-600 mb-6">Your account doesn’t have stylist access. Switch to your dashboard to continue.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push(redirectPath)}
              className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            >
              Go to {roleLabel}
            </button>
            <button
              onClick={async () => {
                await signOut()
                router.push('/login?redirect=/dashboard/stylist')
              }}
              className="inline-flex justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated and is a stylist - show the protected content
  return <>{children}</>
}
