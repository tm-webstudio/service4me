/**
 * Authentication Types - V2
 *
 * New authentication system with proper type safety
 * Based on design document: NEW_AUTH_ARCHITECTURE_DESIGN.md
 */

import type { User, Session } from '@supabase/supabase-js'

/**
 * User roles in the system
 */
export type UserRole = 'client' | 'stylist' | 'admin'

/**
 * Authentication status enum
 * Represents the current state of the authentication system
 */
export enum AuthStatus {
  /** Initial state - auth system is starting up */
  INITIALIZING = 'initializing',

  /** Auth system ready - user is authenticated */
  AUTHENTICATED = 'authenticated',

  /** Auth system ready - user is not authenticated */
  UNAUTHENTICATED = 'unauthenticated',

  /** Auth operation in progress (login, logout, etc.) */
  LOADING = 'loading',

  /** Auth system encountered an error */
  ERROR = 'error'
}

/**
 * Stylist-specific profile data
 */
export interface StylistProfile {
  id: string
  businessName: string
  location: string
  phone: string | null
  contactEmail: string | null
}

/**
 * Complete user profile data
 * Combines auth metadata with database profile
 * SINGLE SOURCE OF TRUTH for user data
 */
export interface UserProfile {
  /** User ID (matches auth.users.id) */
  id: string

  /** User email address */
  email: string

  /** User's full name */
  fullName: string | null

  /** User role - SINGLE SOURCE OF TRUTH */
  role: UserRole

  /** Avatar/profile image URL */
  avatarUrl: string | null

  /** Phone number */
  phone: string | null

  /** Account created timestamp */
  createdAt: string

  /** Last updated timestamp */
  updatedAt: string

  /** Stylist-specific data (only if role === 'stylist') */
  stylistProfile?: StylistProfile
}

/**
 * Structured error information
 */
export interface AuthError {
  /** Error code for programmatic handling */
  code: string

  /** User-friendly error message */
  message: string

  /** Technical details for debugging */
  details?: string

  /** Whether the error is recoverable */
  recoverable: boolean

  /** Suggested action for the user */
  action?: 'retry' | 'login' | 'contact_support' | 'refresh'
}

/**
 * Complete authentication state
 */
export interface AuthState {
  /** Current auth status */
  status: AuthStatus

  /** User profile (null if not authenticated) */
  user: UserProfile | null

  /** Current error (null if no error) */
  error: AuthError | null

  /** Supabase session object (internal use) */
  session: Session | null
}

/**
 * Sign up additional data
 */
export interface SignUpData {
  fullName?: string
  phone?: string
  businessName?: string
  location?: string
}

/**
 * Authentication actions/methods
 */
export interface AuthActions {
  /**
   * Sign in with email and password
   * @throws AuthError if sign in fails
   */
  signIn: (email: string, password: string) => Promise<void>

  /**
   * Sign up a new user
   * @throws AuthError if sign up fails
   */
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: SignUpData
  ) => Promise<void>

  /**
   * Sign out the current user
   * @throws AuthError if sign out fails (but clears local state anyway)
   */
  signOut: () => Promise<void>

  /**
   * Refresh user profile data from database
   */
  refreshProfile: () => Promise<void>

  /**
   * Clear the current error
   */
  clearError: () => void

  /**
   * Retry the last failed operation
   * Only available if error.recoverable === true
   */
  retry: () => Promise<void>
}

/**
 * Complete auth context value
 * Combines state and actions
 */
export interface AuthContextValue extends AuthState, AuthActions {
  /** Convenience: Check if user is authenticated */
  isAuthenticated: boolean

  /** Convenience: Check if auth is initializing */
  isInitializing: boolean

  /** Convenience: Check if an auth operation is in progress */
  isLoading: boolean

  /** Convenience: Get dashboard URL for current user */
  getDashboardUrl: () => string
}

/**
 * Internal state machine for managing auth flow
 * Not exposed to consumers
 */
export interface AuthStateMachine {
  /** Current state */
  current: AuthStatus

  /** Pending operation (if any) */
  pendingOperation: 'signin' | 'signup' | 'signout' | 'refresh' | null

  /** Last operation for retry */
  lastOperation?: {
    type: string
    args: any[]
  }
}

/**
 * Database user record type
 */
export interface DatabaseUser {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

/**
 * Database stylist profile record type
 */
export interface DatabaseStylistProfile {
  id: string
  user_id: string
  business_name: string
  location: string
  phone: string | null
  contact_email: string | null
}
