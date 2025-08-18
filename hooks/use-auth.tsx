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
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: role,
          phone: phone
        })

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating user profile from auth:', error)
      } else {
        console.log('User profile created successfully')
        await fetchUserProfile(user.id) // Refresh profile
      }
    } catch (error) {
      console.error('Error creating user profile from auth:', error)
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
          if (user) {
            await createUserProfileFromAuth(user)
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
        const { data: { session } } = await supabase.auth.getSession()
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
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('🔍 [AUTH] Auth state change event:', event)
          
          if (event === 'SIGNED_OUT') {
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
              location: additionalData.location || 'Location not specified'
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
      // Sign out from Supabase - this will trigger the auth state change listener
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        // If signOut fails, manually clear state
        setUser(null)
        setUserProfile(null)
        setSession(null)
        throw error
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