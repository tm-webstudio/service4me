"use client"

/**
 * Authentication Context
 *
 * Authentication system with:
 * - Single source of truth
 * - Sequential initialization (no race conditions)
 * - Proper error handling
 * - Clear loading states
 */

import { createContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import {
  AuthStatus,
  type AuthState,
  type AuthContextValue,
  type UserProfile,
  type UserRole,
  type SignUpData,
  type DatabaseUser,
  type DatabaseStylistProfile
} from './types'
import {
  normalizeError,
  logError,
  getSmartDashboardUrl,
  isSupabaseConfigured,
  ERROR_CATALOG
} from './auth-helpers'

/**
 * Auth Context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Single state object - no more multiple refs!
  const [authState, setAuthState] = useState<AuthState>({
    status: AuthStatus.INITIALIZING,
    user: null,
    error: null,
    session: null
  })

  // Track last operation for retry functionality
  const lastOperationRef = useRef<{ type: string; args: any[] } | null>(null)

  // Track if initialization has been attempted
  const initAttemptedRef = useRef(false)

  /**
   * Fetch user profile from database
   */
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('[AUTH] Fetching user profile for:', userId)

    try {
      // Fetch from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('[AUTH] Error fetching user profile:', userError)
        console.error('[AUTH] Error details:', {
          message: userError.message,
          code: userError.code,
          details: userError.details,
          hint: userError.hint
        })

        // Profile not found
        if (userError.code === 'PGRST116') {
          console.warn('[AUTH] Profile not found for user:', userId)
          return null
        }

        // If error object is empty or malformed, try to provide helpful context
        if (!userError.message && !userError.code) {
          console.error('[AUTH] Malformed error object, user might not have permission to read profile')
          return null
        }

        throw userError
      }

      const dbUser = userData as DatabaseUser

      // Build base profile
      const profile: UserProfile = {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        role: dbUser.role,
        avatarUrl: dbUser.avatar_url,
        phone: dbUser.phone,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at
      }

      // If stylist, fetch stylist profile
      if (profile.role === 'stylist') {
        console.log('[AUTH] Fetching stylist profile for:', userId)

        const { data: stylistData, error: stylistError } = await supabase
          .from('stylist_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!stylistError && stylistData) {
          const dbStylist = stylistData as DatabaseStylistProfile
          profile.stylistProfile = {
            id: dbStylist.id,
            businessName: dbStylist.business_name,
            location: dbStylist.location,
            phone: dbStylist.phone,
            contactEmail: dbStylist.contact_email
          }
        } else {
          console.warn('[AUTH] Stylist profile not found:', stylistError)
        }
      }

      console.log('[AUTH] Profile fetched successfully:', {
        id: profile.id,
        role: profile.role,
        hasStylistProfile: !!profile.stylistProfile
      })

      return profile
    } catch (error) {
      console.error('[AUTH] Unexpected error fetching profile:', error)
      throw error
    }
  }, [])

  /**
   * Create user profile from auth metadata
   */
  const createProfileFromAuth = useCallback(async (
    userId: string,
    email: string,
    role: UserRole,
    additionalData?: SignUpData
  ): Promise<UserProfile | null> => {
    console.log('[AUTH] Creating profile from auth for:', userId)

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          full_name: additionalData?.fullName || null,
          role: role,
          phone: additionalData?.phone || null
        })
        .select()
        .single()

      if (error) {
        console.error('[AUTH] Failed to create profile:', error)
        throw error
      }

      console.log('[AUTH] Profile created successfully')

      // Fetch the complete profile (including stylist data if applicable)
      return await fetchUserProfile(userId)
    } catch (error) {
      console.error('[AUTH] Error creating profile from auth:', error)
      throw error
    }
  }, [fetchUserProfile])

  /**
   * Initialize authentication
   * Sequential, predictable flow
   */
  const initialize = useCallback(async () => {
    // Prevent multiple initialization attempts
    if (initAttemptedRef.current) {
      console.log('[AUTH] Initialization already attempted, skipping')
      return
    }

    initAttemptedRef.current = true
    console.log('[AUTH] Starting initialization...')

    try {
      // Step 1: Check Supabase configuration
      if (!isSupabaseConfigured()) {
        throw {
          code: 'CONFIG_MISSING',
          ...ERROR_CATALOG.CONFIG_MISSING
        }
      }

      // Step 2: Get current session
      console.log('[AUTH] Checking for existing session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('[AUTH] Session error:', sessionError)
        throw {
          code: 'SESSION_ERROR',
          ...ERROR_CATALOG.SESSION_ERROR,
          details: sessionError.message
        }
      }

      // Step 3: No session = unauthenticated
      if (!session) {
        console.log('[AUTH] No session found, user is unauthenticated')
        setAuthState({
          status: AuthStatus.UNAUTHENTICATED,
          user: null,
          session: null,
          error: null
        })
        return
      }

      console.log('[AUTH] Session found for user:', session.user.id)

      // Step 4: Fetch user profile
      let profile = await fetchUserProfile(session.user.id)

      // Step 5: If profile doesn't exist, create it from auth metadata
      if (!profile) {
        console.log('[AUTH] Profile not found, creating from auth metadata...')
        const role = (session.user.user_metadata?.role as UserRole) || 'client'
        profile = await createProfileFromAuth(
          session.user.id,
          session.user.email || '',
          role,
          {
            fullName: session.user.user_metadata?.full_name,
            phone: session.user.user_metadata?.phone
          }
        )

        if (!profile) {
          throw {
            code: 'PROFILE_CREATE_FAILED',
            ...ERROR_CATALOG.PROFILE_CREATE_FAILED
          }
        }
      }

      // Step 6: Set authenticated state
      console.log('[AUTH] Initialization complete - user authenticated')
      setAuthState({
        status: AuthStatus.AUTHENTICATED,
        user: profile,
        session: session,
        error: null
      })
    } catch (error) {
      console.error('[AUTH] Initialization failed:', error)
      const authError = normalizeError(error)
      logError(authError)

      setAuthState({
        status: AuthStatus.ERROR,
        user: null,
        session: null,
        error: authError
      })
    }
  }, [fetchUserProfile, createProfileFromAuth])

  /**
   * Handle auth state changes from Supabase
   */
  const handleAuthStateChange = useCallback(async (
    event: AuthChangeEvent,
    session: Session | null
  ) => {
    console.log('[AUTH] Auth state change:', event, 'Has session:', !!session)

    try {
      switch (event) {
        case 'SIGNED_OUT':
          console.log('[AUTH] User signed out')
          setAuthState({
            status: AuthStatus.UNAUTHENTICATED,
            user: null,
            session: null,
            error: null
          })
          break

        case 'TOKEN_REFRESHED':
          console.log('[AUTH] Token refreshed')
          // Update session but keep user data
          setAuthState(prev => ({
            ...prev,
            session: session
          }))
          break

        case 'USER_UPDATED':
          console.log('[AUTH] User updated, refreshing profile...')
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id)
            if (profile) {
              setAuthState(prev => ({
                ...prev,
                user: profile,
                session: session
              }))
            }
          }
          break

        case 'SIGNED_IN':
          // Sign in is handled by signIn() method
          // Don't handle here to avoid race conditions
          console.log('[AUTH] SIGNED_IN event (handled by signIn method)')
          break

        default:
          console.log('[AUTH] Unhandled auth event:', event)
      }
    } catch (error) {
      console.error('[AUTH] Error handling auth state change:', error)
      const authError = normalizeError(error)
      logError(authError)

      setAuthState(prev => ({
        ...prev,
        error: authError
      }))
    }
  }, [fetchUserProfile])

  /**
   * Initialize on mount
   */
  useEffect(() => {
    // Initialize auth
    initialize()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [initialize, handleAuthStateChange])

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    console.log('[AUTH] Sign in started for:', email)

    // Store operation for retry
    lastOperationRef.current = {
      type: 'signIn',
      args: [email, password]
    }

    try {
      // Set loading state
      setAuthState(prev => ({
        ...prev,
        status: AuthStatus.LOADING,
        error: null
      }))

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('[AUTH] Sign in failed:', error)
        throw error
      }

      if (!data.user || !data.session) {
        throw new Error('Sign in succeeded but no user data returned')
      }

      console.log('[AUTH] Sign in successful, fetching profile...')

      // Fetch user profile
      const profile = await fetchUserProfile(data.user.id)

      if (!profile) {
        // Create profile if it doesn't exist
        const role = (data.user.user_metadata?.role as UserRole) || 'client'
        const createdProfile = await createProfileFromAuth(
          data.user.id,
          data.user.email || '',
          role,
          {
            fullName: data.user.user_metadata?.full_name,
            phone: data.user.user_metadata?.phone
          }
        )

        if (!createdProfile) {
          throw {
            code: 'PROFILE_NOT_FOUND',
            ...ERROR_CATALOG.PROFILE_NOT_FOUND
          }
        }

        // Set authenticated state with created profile
        setAuthState({
          status: AuthStatus.AUTHENTICATED,
          user: createdProfile,
          session: data.session,
          error: null
        })
      } else {
        // Set authenticated state with fetched profile
        setAuthState({
          status: AuthStatus.AUTHENTICATED,
          user: profile,
          session: data.session,
          error: null
        })
      }

      console.log('[AUTH] Sign in complete')
    } catch (error) {
      console.error('[AUTH] Sign in error:', error)
      const authError = normalizeError(error)
      logError(authError)

      setAuthState({
        status: AuthStatus.ERROR,
        user: null,
        session: null,
        error: authError
      })

      throw authError
    }
  }, [fetchUserProfile, createProfileFromAuth])

  /**
   * Sign up a new user
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: SignUpData
  ): Promise<void> => {
    console.log('[AUTH] Sign up started for:', email, 'as', role)

    // Store operation for retry
    lastOperationRef.current = {
      type: 'signUp',
      args: [email, password, role, additionalData]
    }

    try {
      // Set loading state
      setAuthState(prev => ({
        ...prev,
        status: AuthStatus.LOADING,
        error: null
      }))

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: additionalData?.fullName,
            phone: additionalData?.phone,
            businessName: additionalData?.businessName,
            location: additionalData?.location
          }
        }
      })

      if (error) {
        console.error('[AUTH] Sign up failed:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('Sign up succeeded but no user data returned')
      }

      console.log('[AUTH] Sign up successful, user:', data.user.id)

      // If email confirmation is required, don't create profile yet
      if (!data.user.email_confirmed_at && data.user.confirmation_sent_at) {
        console.log('[AUTH] Email confirmation required')
        setAuthState({
          status: AuthStatus.UNAUTHENTICATED,
          user: null,
          session: null,
          error: null
        })
        return
      }

      // Create user profile
      const profile = await createProfileFromAuth(
        data.user.id,
        email,
        role,
        additionalData
      )

      if (!profile) {
        throw {
          code: 'PROFILE_CREATE_FAILED',
          ...ERROR_CATALOG.PROFILE_CREATE_FAILED
        }
      }

      // If stylist, update stylist profile with additional data
      if (role === 'stylist' && additionalData?.businessName) {
        console.log('[AUTH] Updating stylist profile...')
        await supabase
          .from('stylist_profiles')
          .update({
            business_name: additionalData.businessName,
            location: additionalData.location || '',
            phone: additionalData.phone || null,
            contact_email: email
          })
          .eq('user_id', data.user.id)
      }

      // Set authenticated state
      setAuthState({
        status: AuthStatus.AUTHENTICATED,
        user: profile,
        session: data.session,
        error: null
      })

      console.log('[AUTH] Sign up complete')
    } catch (error) {
      console.error('[AUTH] Sign up error:', error)
      const authError = normalizeError(error)
      logError(authError)

      setAuthState({
        status: AuthStatus.ERROR,
        user: null,
        session: null,
        error: authError
      })

      throw authError
    }
  }, [createProfileFromAuth])

  /**
   * Sign out
   */
  const signOut = useCallback(async (): Promise<void> => {
    console.log('[AUTH] Sign out started')

    try {
      // Optimistically clear state immediately for better UX
      setAuthState({
        status: AuthStatus.LOADING,
        user: null,
        session: null,
        error: null
      })

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[AUTH] Sign out error:', error)
        // Still set unauthenticated even if error
      }

      // Set unauthenticated state
      setAuthState({
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        error: null
      })

      console.log('[AUTH] Sign out complete')
    } catch (error) {
      console.error('[AUTH] Sign out unexpected error:', error)
      // Still set unauthenticated even if error
      setAuthState({
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        error: null
      })
    }
  }, [])

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    console.log('[AUTH] Refresh profile started')

    if (!authState.session?.user) {
      console.warn('[AUTH] Cannot refresh profile - no session')
      return
    }

    try {
      const profile = await fetchUserProfile(authState.session.user.id)

      if (profile) {
        setAuthState(prev => ({
          ...prev,
          user: profile
        }))
        console.log('[AUTH] Profile refreshed successfully')
      }
    } catch (error) {
      console.error('[AUTH] Error refreshing profile:', error)
      const authError = normalizeError(error)
      logError(authError)

      setAuthState(prev => ({
        ...prev,
        error: authError
      }))
    }
  }, [authState.session, fetchUserProfile])

  /**
   * Clear error
   */
  const clearError = useCallback((): void => {
    console.log('[AUTH] Clearing error')
    setAuthState(prev => ({
      ...prev,
      error: null,
      status: prev.user ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED
    }))
  }, [])

  /**
   * Retry last operation
   */
  const retry = useCallback(async (): Promise<void> => {
    console.log('[AUTH] Retry requested')

    if (!lastOperationRef.current) {
      console.warn('[AUTH] No operation to retry')
      return
    }

    const { type, args } = lastOperationRef.current

    console.log('[AUTH] Retrying:', type)

    switch (type) {
      case 'signIn':
        await signIn(args[0], args[1])
        break
      case 'signUp':
        await signUp(args[0], args[1], args[2], args[3])
        break
      default:
        console.warn('[AUTH] Unknown operation type:', type)
    }
  }, [signIn, signUp])

  /**
   * Get dashboard URL
   */
  const getDashboardUrl = useCallback((): string => {
    return getSmartDashboardUrl(authState.user)
  }, [authState.user])

  // Computed values
  const isAuthenticated = authState.status === AuthStatus.AUTHENTICATED
  const isInitializing = authState.status === AuthStatus.INITIALIZING
  const isLoading = authState.status === AuthStatus.LOADING

  // Context value
  const value: AuthContextValue = {
    // State
    status: authState.status,
    user: authState.user,
    error: authState.error,
    session: authState.session,

    // Actions
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearError,
    retry,

    // Computed
    isAuthenticated,
    isInitializing,
    isLoading,
    getDashboardUrl
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
