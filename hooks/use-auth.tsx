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

  const createUserProfileFromAuth = async (user: User) => {
    // Extract role from user metadata or default to client
    const role = user.user_metadata?.role || 'client'
    const fullName = user.user_metadata?.full_name || null
    const phone = user.user_metadata?.phone || null

    try {
      console.log('🔧 [AUTH] Creating user profile with data:', {
        id: user.id,
        email: user.email,
        full_name: fullName,
        role: role,
        phone: phone
      })

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

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('❌ [AUTH] Error creating user profile from auth:', error)
        setUserProfile(null)
      } else if (error?.code === '23505') {
        // User already exists, just fetch it
        console.log('✅ [AUTH] User profile already exists, fetching...')
        await fetchUserProfile(user.id)
      } else {
        console.log('✅ [AUTH] User profile created successfully:', data)
        setUserProfile(data)
        
        // If this is a stylist, create stylist profile with sign-up data
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
            console.error('❌ [AUTH] Error updating stylist profile from auth:', stylistUpdateError)
          } else {
            console.log('✅ [AUTH] Stylist profile updated with sign-up data')
          }
        }
      }
    } catch (error) {
      console.error('❌ [AUTH] Exception creating user profile from auth:', error)
      setUserProfile(null)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      // Prevent duplicate fetches for the same user within a short timeframe
      const lastFetchKey = `lastUserFetch_${userId}`
      const lastFetchTime = sessionStorage.getItem(lastFetchKey)
      const now = Date.now()
      
      if (lastFetchTime && (now - parseInt(lastFetchTime)) < 5000) { // 5 second cooldown
        console.log('🔍 [AUTH] Skipping recent fetch for user:', userId)
        return
      }

      sessionStorage.setItem(lastFetchKey, now.toString())
      console.log('🔍 [AUTH] Fetching user profile for ID:', userId)
      
      // Check if we have a valid session first
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔍 [AUTH] Current session exists:', !!session)
      console.log('🔍 [AUTH] Session user ID:', session?.user?.id)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ [AUTH] Error fetching user profile:', error)
        console.error('❌ [AUTH] Error code:', error.code)
        console.error('❌ [AUTH] Error details:', JSON.stringify(error, null, 2))
        
        if (error.code === 'PGRST116') {
          // No profile found - try to create one from auth user data
          console.log('🔧 [AUTH] No user profile found, creating from auth data for user:', userId)
          const { data: { user } } = await supabase.auth.getUser()
          if (user && user.id === userId) {
            // Prevent recursive calls by checking if we've already tried creating this user
            const attemptKey = `createAttempt_${userId}`
            const lastAttempt = sessionStorage.getItem(attemptKey)
            const now = Date.now()
            
            if (!lastAttempt || (now - parseInt(lastAttempt)) > 30000) { // 30 second cooldown
              sessionStorage.setItem(attemptKey, now.toString())
              await createUserProfileFromAuth(user)
            } else {
              console.log('⚠️ [AUTH] Recent creation attempt failed, skipping retry')
              setUserProfile(null)
            }
          } else {
            setUserProfile(null)
          }
        } else {
          setUserProfile(null)
        }
        return
      }
      
      console.log('✅ [AUTH] User profile fetched successfully:', JSON.stringify(data, null, 2))
      setUserProfile(data)
    } catch (error) {
      console.error('❌ [AUTH] Exception fetching user profile:', error)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured with valid environment variables')
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // Handle refresh token errors gracefully
        if (error) {
          console.warn('⚠️ [AUTH] Session error:', error.message)
          if (error.message?.includes('Refresh Token Not Found') || 
              error.message?.includes('Invalid Refresh Token')) {
            // Clear any stored session data and proceed as unauthenticated
            setSession(null)
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            return
          }
          throw error
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error getting session:', error)
        // Clear all auth state on any error to prevent stuck loading states
        setSession(null)
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('🔍 [AUTH] Auth state change event:', event)
          
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED') {
            setSession(null)
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            lastFetchedUserId.current = null
            return
          }
          
          // Only fetch profile for actual sign-in events, not initial session
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setSession(session)
            setUser(session?.user ?? null)
            
            if (session?.user) {
              await fetchUserProfile(session.user.id)
            } else {
              setUserProfile(null)
            }
            
            setLoading(false)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          // Clear auth state on any error during state change
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
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

      // Only create user profile if email is confirmed (or if confirmation is disabled)
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
          console.error('Error creating user profile:', profileError)
        } else if (role === 'stylist' && additionalData) {
          // Update the stylist profile with actual user data
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
            console.error('Error updating stylist profile:', stylistUpdateError)
          }
        }
      }

      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Authentication not available - missing configuration')
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Signin error:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      // Even if not configured, clear local state
      setUser(null)
      setUserProfile(null)
      setSession(null)
      return
    }
    
    try {
      // Check if there's an active session before attempting signOut
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Sign out from Supabase - this will trigger the auth state change listener
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.warn('⚠️ [AUTH] SignOut error:', error.message)
          // If signOut fails, manually clear state
          setUser(null)
          setUserProfile(null)
          setSession(null)
          return
        }
      } else {
        // No active session, just clear local state
        console.log('🔍 [AUTH] No active session, clearing local state only')
        setUser(null)
        setUserProfile(null)
        setSession(null)
        return
      }
    } catch (error) {
      console.error('Signout error:', error)
      // Even if there's an error, clear local state to ensure user is signed out locally
      setUser(null)
      setUserProfile(null)
      setSession(null)
    }
  }

  const getDashboardUrl = () => {
    if (!userProfile) return '/dashboard/client' // Default to client
    
    switch (userProfile.role) {
      case 'stylist':
        return '/dashboard/stylist'
      case 'client':
        return '/dashboard/client'
      default:
        return '/dashboard/client' // Default to client for unknown roles
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