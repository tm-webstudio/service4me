/**
 * Auth - Main Export
 *
 * Central export point for authentication system
 */

// Context and Provider
export { AuthProvider, AuthContext } from './auth-context'

// Hook
export { useAuth } from './use-auth'

// Route Protection
export { ProtectedRoute, PublicRoute } from './route-protection'

// Types
export {
  AuthStatus,
  type UserRole,
  type UserProfile,
  type AuthError,
  type AuthState,
  type AuthContextValue,
  type SignUpData,
  type StylistProfile
} from './types'

// Helpers (for internal use or advanced cases)
export {
  normalizeError,
  logError,
  getSmartDashboardUrl,
  getDashboardUrlForRole,
  isSupabaseConfigured,
  isValidEmail,
  ERROR_CATALOG
} from './auth-helpers'
