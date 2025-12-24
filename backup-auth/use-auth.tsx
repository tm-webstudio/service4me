"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'client' | 'stylist' | 'admin'
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, role: 'client' | 'stylist', additionalData?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  getDashboardUrl: () => string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  session: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  getDashboardUrl: () => '/dashboard/client'
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const lastFetchedUserId = useRef<string | null>(null)
  const initialSessionHandled = useRef<boolean>(false)
  // NEW: Track when signIn() is handling auth to prevent duplicate onAuthStateChange handling
  const signInInProgress = useRef<boolean>(false)

  const createUserProfileFromAuth = async (user: User) => {
    const role = user.user_metadata?.role || 'client'
    const fullName = user.user_metadata?.full_name || null
    const phone = user.user_metadata?.phone || null

    console.log('🔧 [CREATE-PROFILE] Creating profile from auth for user:', user.id, { role, fullName })

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: role,
          phone: phone
        })
        .select()
        .single()

      if (error && error.code !== '23505') {
        console.error('❌ [CREATE-PROFILE] Failed to insert user profile:', error)
        setUserProfile(null)
      } else if (error?.code === '23505') {
        console.log('⚠️ [CREATE-PROFILE] Profile already exists (duplicate key), fetching existing...')
        await fetchUserProfile(user.id)
      } else {
        console.log('✅ [CREATE-PROFILE] Profile created successfully')
        setUserProfile(data)
        if (role === 'stylist' && user.user_metadata) {
          console.log('🔧 [CREATE-PROFILE] Updating stylist profile with metadata...')
          const { error: stylistUpdateError } = await supabase
            .from('stylist_profiles')
            .update({
              business_name: user.user_metadata.businessName || 'My Hair Studio',
              location: user.user_metadata.location || 'Location not specified',
              phone: phone,
              contact_email: user.email
            })
            .eq('user_id', user.id)

          if (stylistUpdateError) {
            console.error('❌ [CREATE-PROFILE] Failed to update stylist profile:', stylistUpdateError)
          } else {
            console.log('✅ [CREATE-PROFILE] Stylist profile updated successfully')
          }
        }
      }
    } catch (error) {
      console.error('❌ [CREATE-PROFILE] Unexpected error:', error)
      setUserProfile(null)
    }
  }

  const fetchUserProfile = async (userId: string, forceRefresh: boolean = false): Promise<UserProfile | null> => {
    console.log('🔧 [FETCH-PROFILE] fetchUserProfile called', {
      userId,
      forceRefresh,
      cachedUserId: lastFetchedUserId.current,
      hasExistingProfile: !!userProfile
    })

    try {
      // Skip cache check if force refresh is requested (e.g., during sign in)
      if (!forceRefresh && lastFetchedUserId.current === userId && userProfile) {
        console.log('✅ [FETCH-PROFILE] Using cached profile for user:', userId)
        return userProfile
      }

      console.log('🔧 [FETCH-PROFILE] Fetching profile from database for user:', userId)
      lastFetchedUserId.current = userId

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('🔧 [FETCH-PROFILE] Database query result', {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message
      })

      if (error) {
        console.error('❌ [FETCH-PROFILE] Error fetching profile:', error)
        if (error.code === 'PGRST116') {
          console.log('⚠️ [FETCH-PROFILE] Profile not found (PGRST116), attempting to create')
          // No profile found - try to create one from auth user data
          const { data: { user } } = await supabase.auth.getUser()
          console.log('🔧 [FETCH-PROFILE] Got auth user', { hasUser: !!user, userId: user?.id })
          if (user && user.id === userId) {
            console.log('🔧 [FETCH-PROFILE] Creating profile from auth data')
            await createUserProfileFromAuth(user)
            // After creating, the profile should be set by createUserProfileFromAuth
            console.log('✅ [FETCH-PROFILE] Profile creation completed')
            return userProfile
          }
        }
        console.log('❌ [FETCH-PROFILE] Setting userProfile to null due to error')
        setUserProfile(null)
        lastFetchedUserId.current = null
        return null
      }

      console.log('✅ [FETCH-PROFILE] Profile fetched successfully', {
        role: data.role,
        email: data.email,
        fullName: data.full_name
      })
      setUserProfile(data)
      return data
    } catch (error) {
      console.error('❌ [FETCH-PROFILE] Unexpected error:', error)
      setUserProfile(null)
      lastFetchedUserId.current = null
      return null
    }
  }

  useEffect(() => {
    console.log('🔧 [AUTH] useEffect triggered - Supabase configured:', isSupabaseConfigured())

    if (!isSupabaseConfigured()) {
      console.log('❌ [AUTH] Supabase not configured, setting loading to false')
      setLoading(false)
      return
    }

    // Handle session initialization from auth state change
    const handleSession = async (newSession: Session | null, isInitial: boolean = false) => {
      console.log('🔧 [AUTH-SESSION] handleSession called', {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
        isInitial,
        timestamp: new Date().toISOString()
      })

      try {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          console.log('🔧 [AUTH-SESSION] User found, fetching profile for:', newSession.user.id)
          await fetchUserProfile(newSession.user.id)
          console.log('✅ [AUTH-SESSION] Profile fetch completed')
        } else {
          console.log('⚠️ [AUTH-SESSION] No user in session, clearing userProfile')
          setUserProfile(null)
        }
      } catch (error) {
        console.error('❌ [AUTH-SESSION] Error in handleSession:', error)
        setUserProfile(null)
      } finally {
        // Always ensure loading is set to false
        console.log('🔧 [AUTH-SESSION] Setting loading to false')
        setLoading(false)
      }
    }

    // Subscribe to auth state changes FIRST
    // This ensures we catch the INITIAL_SESSION event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔧 [AUTH-EVENT]', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        })

        try {
          // Handle sign out immediately
          if (event === 'SIGNED_OUT') {
            console.log('🔧 [AUTH-EVENT] SIGNED_OUT - Clearing all auth state')
            setSession(null)
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            lastFetchedUserId.current = null
            initialSessionHandled.current = false
            return
          }

          // Handle INITIAL_SESSION - fired immediately when subscription is set up
          if (event === 'INITIAL_SESSION') {
            console.log('🔧 [AUTH-EVENT] INITIAL_SESSION detected', {
              alreadyHandled: initialSessionHandled.current
            })
            // Mark that initial session has been handled
            initialSessionHandled.current = true
            lastFetchedUserId.current = null
            await handleSession(session, true)
            return
          }

          // Handle sign in and token refresh
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('🔧 [AUTH-EVENT]', event, '- Processing auth event', {
              signInInProgress: signInInProgress.current
            })

            // CRITICAL FIX: Skip SIGNED_IN if signIn() is already handling it
            // This prevents duplicate profile fetches and race conditions
            if (event === 'SIGNED_IN' && signInInProgress.current) {
              console.log('⏭️ [AUTH-EVENT] SIGNED_IN skipped - signIn() is handling this')
              return
            }

            // Reset lastFetchedUserId for new sign ins to force profile fetch
            if (event === 'SIGNED_IN') {
              console.log('🔧 [AUTH-EVENT] SIGNED_IN - Resetting lastFetchedUserId')
              lastFetchedUserId.current = null
            }
            await handleSession(session)
            return
          }

          // Handle any other events (USER_UPDATED, PASSWORD_RECOVERY, etc.)
          // Still update session state and ensure loading is set to false
          console.log('🔧 [AUTH-EVENT] Other event:', event)
          if (session) {
            await handleSession(session)
          } else {
            console.log('🔧 [AUTH-EVENT] No session, setting loading to false')
            setLoading(false)
          }
        } catch (error) {
          console.error('❌ [AUTH-EVENT] Error handling auth event:', error)
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    )

    // Fallback: If INITIAL_SESSION doesn't fire within 100ms, fetch session manually
    // This handles edge cases where the event might not fire
    const fallbackTimeout = setTimeout(async () => {
      console.log('🔧 [AUTH-FALLBACK] Fallback timeout triggered', {
        alreadyHandled: initialSessionHandled.current
      })

      if (!initialSessionHandled.current) {
        console.log('🔧 [AUTH-FALLBACK] INITIAL_SESSION not handled yet, fetching session manually')
        try {
          lastFetchedUserId.current = null
          const { data: { session }, error } = await supabase.auth.getSession()

          console.log('🔧 [AUTH-FALLBACK] getSession result', {
            hasSession: !!session,
            hasError: !!error,
            errorMessage: error?.message
          })

          if (error) {
            console.error('❌ [AUTH-FALLBACK] Error fetching session:', error)
            if (error.message?.includes('Refresh Token Not Found') ||
                error.message?.includes('Invalid Refresh Token')) {
              console.log('🔧 [AUTH-FALLBACK] Invalid refresh token, clearing auth state')
              setSession(null)
              setUser(null)
              setUserProfile(null)
              setLoading(false)
              return
            }
            throw error
          }

          // Only process if INITIAL_SESSION hasn't been handled yet
          if (!initialSessionHandled.current) {
            console.log('🔧 [AUTH-FALLBACK] Processing fallback session')
            initialSessionHandled.current = true
            await handleSession(session, true)
          } else {
            console.log('⚠️ [AUTH-FALLBACK] Session already handled, skipping')
          }
        } catch (error) {
          console.error('❌ [AUTH-FALLBACK] Fallback failed:', error)
          setSession(null)
          setUser(null)
          setUserProfile(null)
          lastFetchedUserId.current = null
          setLoading(false)
        }
      } else {
        console.log('✅ [AUTH-FALLBACK] INITIAL_SESSION already handled, no fallback needed')
      }
    }, 100)

    return () => {
      clearTimeout(fallbackTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, role: 'client' | 'stylist', additionalData?: any) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Authentication not available - missing configuration')
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: additionalData?.full_name,
            phone: additionalData?.phone
          }
        }
      })

      if (error) throw error

      if (data.user && (data.user.email_confirmed_at || !data.user.confirmation_sent_at)) {
        console.log('🔧 [SIGN-UP] Creating user profile for:', data.user.id)
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: additionalData?.full_name || null,
            role: role,
            phone: additionalData?.phone || null
          })

        if (profileError) {
          console.error('❌ [SIGN-UP] Failed to create user profile:', profileError)
        } else {
          console.log('✅ [SIGN-UP] User profile created successfully')
          if (role === 'stylist' && additionalData) {
            console.log('🔧 [SIGN-UP] Updating stylist profile...')
            const { error: stylistUpdateError } = await supabase
              .from('stylist_profiles')
              .update({
                business_name: additionalData.businessName || 'My Hair Studio',
                location: additionalData.location || 'Location not specified',
                phone: additionalData.phone || null,
                contact_email: data.user.email || null
              })
              .eq('user_id', data.user.id)

            if (stylistUpdateError) {
              console.error('❌ [SIGN-UP] Failed to update stylist profile:', stylistUpdateError)
            } else {
              console.log('✅ [SIGN-UP] Stylist profile updated successfully')
            }
          }
        }
      }

      return data
    } catch (error) {
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔧 [SIGN-IN] signIn called for email:', email)

    if (!isSupabaseConfigured()) {
      console.error('❌ [SIGN-IN] Supabase not configured')
      throw new Error('Authentication not available - missing configuration')
    }

    // CRITICAL: Mark that signIn is handling auth to prevent onAuthStateChange duplicate handling
    signInInProgress.current = true
    console.log('🔧 [SIGN-IN] Set signInInProgress = true')

    try {
      console.log('🔧 [SIGN-IN] Calling Supabase signInWithPassword')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ [SIGN-IN] Sign in failed:', error)
        throw error
      }

      console.log('✅ [SIGN-IN] Sign in successful', {
        userId: data.user?.id,
        userRole: data.user?.user_metadata?.role
      })

      // Set user and session FIRST
      setUser(data.user)
      setSession(data.session)

      // Fetch profile and wait for it - ensures userProfile is available before redirect
      if (data.user) {
        console.log('🔧 [SIGN-IN] Fetching user profile...')
        lastFetchedUserId.current = null
        const profile = await fetchUserProfile(data.user.id, true)
        console.log('✅ [SIGN-IN] Profile fetch completed', {
          hasProfile: !!profile,
          profileRole: profile?.role
        })

        // Double-check userProfile state is set before returning
        if (!profile) {
          console.warn('⚠️ [SIGN-IN] Profile fetch returned null, checking state...')
        }
      }

      console.log('🔧 [SIGN-IN] Setting loading to false')
      setLoading(false)
      return data
    } finally {
      // ALWAYS clear the flag after signIn completes (success or error)
      console.log('🔧 [SIGN-IN] Clearing signInInProgress flag')
      signInInProgress.current = false
    }
  }

  const signOut = async () => {
    // Clear local state IMMEDIATELY for instant UI response
    setUser(null)
    setUserProfile(null)
    setSession(null)
    lastFetchedUserId.current = null
    sessionStorage.clear()

    // Then handle the Supabase sign out in the background
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      // This runs async but doesn't block the UI
      await supabase.auth.signOut()
    } catch (error) {
      // Silently handle errors since we've already cleared the local state
      // The user is already signed out from the UI perspective
    }
  }

  const getDashboardUrl = () => {
    const role = userProfile?.role || user?.user_metadata?.role

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

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      getDashboardUrl
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}