/**
 * Authentication Helper Utilities - V2
 *
 * Utility functions for error handling, normalization, and helpers
 */

import type { AuthError, UserRole, UserProfile } from './types'

/**
 * Error catalog with predefined error configurations
 */
export const ERROR_CATALOG = {
  // Network/Connection Errors (Recoverable)
  NETWORK_ERROR: {
    message: 'Unable to connect to authentication service',
    recoverable: true,
    action: 'retry' as const,
    logLevel: 'warn' as const
  },

  // Configuration Errors (Not Recoverable)
  CONFIG_MISSING: {
    message: 'Authentication service is not configured',
    recoverable: false,
    action: 'contact_support' as const,
    logLevel: 'error' as const
  },

  // Credential Errors (Not Recoverable - user error)
  INVALID_CREDENTIALS: {
    message: 'Invalid email or password',
    recoverable: false,
    action: 'login' as const,
    logLevel: 'info' as const
  },

  // Profile Errors (Recoverable)
  PROFILE_NOT_FOUND: {
    message: 'User profile not found',
    recoverable: true,
    action: 'retry' as const,
    logLevel: 'warn' as const
  },

  PROFILE_CREATE_FAILED: {
    message: 'Failed to create user profile',
    recoverable: true,
    action: 'retry' as const,
    logLevel: 'error' as const
  },

  // Session Errors (Recoverable)
  SESSION_EXPIRED: {
    message: 'Your session has expired. Please sign in again.',
    recoverable: false,
    action: 'login' as const,
    logLevel: 'info' as const
  },

  SESSION_ERROR: {
    message: 'Failed to restore session',
    recoverable: true,
    action: 'retry' as const,
    logLevel: 'warn' as const
  },

  // Database Errors (Recoverable)
  DATABASE_ERROR: {
    message: 'Database error occurred',
    recoverable: true,
    action: 'retry' as const,
    logLevel: 'error' as const
  },

  // Sign up errors
  EMAIL_ALREADY_EXISTS: {
    message: 'An account with this email already exists',
    recoverable: false,
    action: 'login' as const,
    logLevel: 'info' as const
  },

  WEAK_PASSWORD: {
    message: 'Password is too weak. Please use a stronger password.',
    recoverable: false,
    action: 'retry' as const,
    logLevel: 'info' as const
  },

  // Generic Errors
  UNKNOWN_ERROR: {
    message: 'An unexpected error occurred',
    recoverable: true,
    action: 'retry' as const,
    logLevel: 'error' as const
  }
} as const

/**
 * Normalize any error into structured AuthError
 */
export function normalizeError(error: unknown): AuthError {
  // Already an AuthError
  if (isAuthError(error)) {
    return error
  }

  const errorMessage = getErrorMessage(error)

  // Supabase auth errors
  if (errorMessage.includes('Invalid login credentials')) {
    return {
      code: 'INVALID_CREDENTIALS',
      ...ERROR_CATALOG.INVALID_CREDENTIALS,
      details: errorMessage
    }
  }

  if (errorMessage.includes('User already registered')) {
    return {
      code: 'EMAIL_ALREADY_EXISTS',
      ...ERROR_CATALOG.EMAIL_ALREADY_EXISTS,
      details: errorMessage
    }
  }

  if (errorMessage.includes('Password should be at least')) {
    return {
      code: 'WEAK_PASSWORD',
      ...ERROR_CATALOG.WEAK_PASSWORD,
      details: errorMessage
    }
  }

  // Network errors
  if (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('NetworkError')
  ) {
    return {
      code: 'NETWORK_ERROR',
      ...ERROR_CATALOG.NETWORK_ERROR,
      details: errorMessage
    }
  }

  // Database errors (PGRST codes)
  if (errorMessage.includes('PGRST')) {
    return {
      code: 'DATABASE_ERROR',
      ...ERROR_CATALOG.DATABASE_ERROR,
      details: errorMessage
    }
  }

  // Session errors
  if (
    errorMessage.includes('refresh_token') ||
    errorMessage.includes('session')
  ) {
    return {
      code: 'SESSION_ERROR',
      ...ERROR_CATALOG.SESSION_ERROR,
      details: errorMessage
    }
  }

  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    ...ERROR_CATALOG.UNKNOWN_ERROR,
    details: errorMessage
  }
}

/**
 * Type guard to check if value is AuthError
 */
function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'recoverable' in error
  )
}

/**
 * Extract error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return String(error)
}

/**
 * Log error based on severity
 */
export function logError(error: AuthError): void {
  const logLevel = ERROR_CATALOG[error.code as keyof typeof ERROR_CATALOG]?.logLevel || 'error'

  const logMessage = `[AUTH ERROR] ${error.code}: ${error.message}`
  const logDetails = error.details ? `\nDetails: ${error.details}` : ''

  switch (logLevel) {
    case 'error':
      console.error(logMessage + logDetails)
      break
    case 'warn':
      console.warn(logMessage + logDetails)
      break
    case 'info':
      console.info(logMessage + logDetails)
      break
    default:
      console.log(logMessage + logDetails)
  }
}

/**
 * Get dashboard URL based on user role
 */
export function getDashboardUrlForRole(role: UserRole | null): string {
  if (!role) return '/login'

  switch (role) {
    case 'admin':
      return '/admin'
    case 'stylist':
      return '/dashboard/stylist'
    case 'client':
      return '/dashboard/client'
    default:
      return '/dashboard/client'
  }
}

/**
 * Get smart dashboard redirect URL
 * Redirects to appropriate dashboard based on user profile
 */
export function getSmartDashboardUrl(user: UserProfile | null): string {
  if (!user) return '/login'
  return getDashboardUrlForRole(user.role)
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return Boolean(
    url &&
    key &&
    url !== 'https://placeholder.supabase.co' &&
    key !== 'placeholder-key'
  )
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sleep utility for testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
