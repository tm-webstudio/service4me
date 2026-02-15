"use client"

/**
 * useAuth Hook
 *
 * Simple hook to access auth context
 */

import { useContext } from 'react'
import { AuthContext } from './auth-context'
import type { AuthContextValue } from './types'

/**
 * Hook to access authentication context
 *
 * @throws Error if used outside AuthProvider
 * @returns AuthContextValue
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, signIn, signOut } = useAuth()
 *
 *   if (isInitializing) {
 *     return <Loading />
 *   }
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={signIn} />
 *   }
 *
 *   return <div>Welcome {user.fullName}</div>
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your app with <AuthProvider> to use authentication.'
    )
  }

  return context
}
