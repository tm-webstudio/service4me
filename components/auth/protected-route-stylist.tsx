"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AuthStatus } from '@/lib/auth/types'
import { Loader2, Lock, AlertCircle } from 'lucide-react'

interface ProtectedStylistRouteProps {
  children: React.ReactNode
}

/**
 * Protected route component for stylist-only pages
 * Uses auth system with proper initialization handling
 *
 * Features:
 * - Single source of truth (userProfile.role)
 * - Proper initialization waiting
 * - Clear error states
 * - Role-based redirects
 * - No race conditions
 */
export function ProtectedStylistRoute({ children }: ProtectedStylistRouteProps) {
  const { status, user, error, signOut, clearError } = useAuth()
  const router = useRouter()

  console.log('[PROTECTED-STYLIST] Render', {
    status,
    hasUser: !!user,
    role: user?.role,
    error: error?.code
  })

  // CRITICAL: Wait for initialization to complete
  // This ensures we don't show wrong content during initial load
  if (status === AuthStatus.INITIALIZING) {
    console.log('[PROTECTED-STYLIST] Waiting for initialization...')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  // Show loading during auth operations (sign in, sign out, etc.)
  if (status === AuthStatus.LOADING) {
    console.log('[PROTECTED-STYLIST] Loading auth operation...')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (status === AuthStatus.ERROR && error) {
    console.log('[PROTECTED-STYLIST] Error state:', error.code)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-lg border bg-white shadow-sm p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                clearError()
                router.push('/login?redirect=/dashboard/stylist')
              }}
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

  // User not authenticated - show login prompt
  if (status === AuthStatus.UNAUTHENTICATED || !user) {
    console.log('[PROTECTED-STYLIST] User not authenticated, showing login prompt')
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

  // User authenticated - check role
  // SINGLE SOURCE OF TRUTH: user.role from auth-v2
  const isStylist = user.role === 'stylist'

  if (!isStylist) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard/client'
    const roleLabel = user.role === 'admin' ? 'Admin dashboard' : 'Client dashboard'

    console.log('[PROTECTED-STYLIST] Wrong role, showing redirect', {
      role: user.role,
      redirectPath
    })

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-lg border bg-white shadow-sm p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stylists Only</h2>
          <p className="text-gray-600 mb-6">
            Your account doesn't have stylist access. Switch to your dashboard to continue.
          </p>
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

  // User is authenticated AND is a stylist - render protected content
  console.log('[PROTECTED-STYLIST] Access granted, rendering children')
  return <>{children}</>
}
