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

  const createUserProfileFromAuth = async (user: User) => {
    const role = user.user_metadata?.role || 'client'
    const fullName = user.user_metadata?.full_name || null
    const phone = user.user_metadata?.phone || null

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
        setUserProfile(null)
      } else if (error?.code === '23505') {
        await fetchUserProfile(user.id)
      } else {
        setUserProfile(data)
        if (role === 'stylist' && user.user_metadata) {
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
          }
        }
      }
    } catch (error) {
      setUserProfile(null)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      // Verify this is still the current session's user
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (!currentSession || currentSession.user.id !== userId) {
        // Session has changed or is invalid, don't fetch profile
        setUserProfile(null)
        return
      }

      // Check if we've already fetched this user recently
      if (lastFetchedUserId.current === userId) {
        return
      }

      lastFetchedUserId.current = userId

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      // Verify session hasn't changed during the fetch
      const { data: { session: verifySession } } = await supabase.auth.getSession()

      if (!verifySession || verifySession.user.id !== userId) {
        // Session changed during fetch, discard results
        setUserProfile(null)
        lastFetchedUserId.current = null
        return
      }

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - try to create one from auth user data
          const { data: { user } } = await supabase.auth.getUser()
          if (user && user.id === userId) {
            await createUserProfileFromAuth(user)
          } else {
            setUserProfile(null)
            lastFetchedUserId.current = null
          }
        } else {
          setUserProfile(null)
          lastFetchedUserId.current = null
        }
        return
      }

      setUserProfile(data)
    } catch (error) {
      setUserProfile(null)
      lastFetchedUserId.current = null
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Handle session initialization from auth state change
    const handleSession = async (newSession: Session | null, isInitial: boolean = false) => {
      try {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id)
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        setUserProfile(null)
      } finally {
        // Always ensure loading is set to false
        setLoading(false)
      }
    }

    // Subscribe to auth state changes FIRST
    // This ensures we catch the INITIAL_SESSION event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // Handle sign out immediately
          if (event === 'SIGNED_OUT') {
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
            // Mark that initial session has been handled
            initialSessionHandled.current = true
            lastFetchedUserId.current = null
            await handleSession(session, true)
            return
          }

          // Handle sign in and token refresh
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Reset lastFetchedUserId for new sign ins to force profile fetch
            if (event === 'SIGNED_IN') {
              lastFetchedUserId.current = null
            }
            await handleSession(session)
            return
          }

          // Handle any other events (USER_UPDATED, PASSWORD_RECOVERY, etc.)
          // Still update session state and ensure loading is set to false
          if (session) {
            await handleSession(session)
          } else {
            setLoading(false)
          }
        } catch (error) {
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
      if (!initialSessionHandled.current) {
        try {
          lastFetchedUserId.current = null
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            if (error.message?.includes('Refresh Token Not Found') ||
                error.message?.includes('Invalid Refresh Token')) {
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
            initialSessionHandled.current = true
            await handleSession(session, true)
          }
        } catch (error) {
          setSession(null)
          setUser(null)
          setUserProfile(null)
          lastFetchedUserId.current = null
          setLoading(false)
        }
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
        } else if (role === 'stylist' && additionalData) {
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
          }
        }
      }

      return data
    } catch (error) {
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Authentication not available - missing configuration')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Immediately set user and session
    setUser(data.user)
    setSession(data.session)
    setLoading(false)

    // Fetch profile in background - don't block the login
    if (data.user) {
      lastFetchedUserId.current = null
      fetchUserProfile(data.user.id).catch(() => {})
    }

    // Return user data with role from user_metadata for immediate redirect
    return data
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