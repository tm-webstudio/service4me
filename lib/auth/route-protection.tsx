"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { AuthStatus, UserRole } from './types'
import { getDashboardUrlForRole } from './auth-helpers'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  /**
   * Where to redirect if not authenticated
   * Default: '/login'
   */
  loginPath?: string
  /**
   * Show loading screen while checking auth
   * Default: true
   */
  showLoadingScreen?: boolean
}

/**
 * Unified route protection component
 *
 * Features:
 * - Blocks access until auth is initialized
 * - Shows loading screen during initialization
 * - Redirects based on auth state and role
 * - Flexible role-based access control
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute allowedRoles={['stylist']}>
 *   <StylistDashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  loginPath = '/login',
  showLoadingScreen = true
}: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const router = useRouter()

  // HOOKS MUST BE CALLED FIRST - before any conditional returns
  const userRole = user?.role
  const hasRequiredRole = userRole ? allowedRoles.includes(userRole) : false

  // Handle redirect to login for unauthenticated users
  useEffect(() => {
    if (status === AuthStatus.UNAUTHENTICATED || !user) {
      console.log('[PROTECTED-ROUTE] User not authenticated, redirecting to login', {
        loginPath,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
      })

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const redirectUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`
        router.push(redirectUrl)
      }
    }
  }, [status, user, loginPath, router])

  // Handle redirect for users with wrong role
  useEffect(() => {
    if (status === AuthStatus.AUTHENTICATED && user && !hasRequiredRole) {
      console.log('[PROTECTED-ROUTE] User has wrong role, redirecting to appropriate dashboard', {
        userRole,
        allowedRoles,
        redirectTo: getDashboardUrlForRole(userRole!)
      })

      const dashboardUrl = getDashboardUrlForRole(userRole!)
      router.push(dashboardUrl)
    }
  }, [status, user, hasRequiredRole, userRole, allowedRoles, router])

  // NOW we can do conditional logic and returns
  console.log('[PROTECTED-ROUTE] Checking access', {
    status,
    hasUser: !!user,
    userRole: user?.role,
    allowedRoles,
    currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
  })

  // CRITICAL: Wait for initialization to complete
  if (status === AuthStatus.INITIALIZING) {
    console.log('[PROTECTED-ROUTE] Waiting for auth initialization...')

    if (!showLoadingScreen) {
      return null
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading during auth operations
  if (status === AuthStatus.LOADING) {
    console.log('[PROTECTED-ROUTE] Auth operation in progress...')

    if (!showLoadingScreen) {
      return null
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // User not authenticated - show redirecting screen
  if (status === AuthStatus.UNAUTHENTICATED || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // User has wrong role - show redirecting screen
  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // User is authenticated AND has required role - allow access
  console.log('[PROTECTED-ROUTE] Access granted', {
    userRole,
    allowedRoles
  })

  return <>{children}</>
}

/**
 * Public route wrapper - redirects authenticated users to their dashboard
 *
 * Use this for login and signup pages to prevent authenticated users
 * from seeing them.
 *
 * Usage:
 * ```tsx
 * <PublicRoute>
 *   <LoginForm />
 * </PublicRoute>
 * ```
 */
export function PublicRoute({
  children,
  showLoadingScreen = true
}: {
  children: React.ReactNode
  showLoadingScreen?: boolean
}) {
  const { status, user } = useAuth()
  const router = useRouter()

  // HOOKS MUST BE CALLED FIRST - before any conditional returns
  // Handle redirect for authenticated users
  useEffect(() => {
    if (status === AuthStatus.AUTHENTICATED && user) {
      console.log('[PUBLIC-ROUTE] User already authenticated, redirecting to dashboard', {
        userRole: user.role,
        redirectTo: getDashboardUrlForRole(user.role)
      })

      const dashboardUrl = getDashboardUrlForRole(user.role)
      router.push(dashboardUrl)
    }
  }, [status, user, router])

  // NOW we can do conditional logic and returns
  console.log('[PUBLIC-ROUTE] Checking access', {
    status,
    hasUser: !!user,
    userRole: user?.role
  })

  // Wait for initialization
  if (status === AuthStatus.INITIALIZING) {
    console.log('[PUBLIC-ROUTE] Waiting for auth initialization...')

    if (!showLoadingScreen) {
      return null
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading during auth operations
  if (status === AuthStatus.LOADING) {
    console.log('[PUBLIC-ROUTE] Auth operation in progress...')

    if (!showLoadingScreen) {
      return null
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === AuthStatus.AUTHENTICATED && user) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // User not authenticated - allow access to public route
  console.log('[PUBLIC-ROUTE] Access granted (user not authenticated)')
  return <>{children}</>
}
