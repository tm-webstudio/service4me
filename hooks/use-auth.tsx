"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - try to create one from auth user data
          console.log('No user profile found, creating from auth data for user:', userId)
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await createUserProfileFromAuth(user)
          }
        } else {
          console.error('Error fetching user profile:', error)
          setUserProfile(null)
        }
        return
      }
      
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
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
          if (event === 'SIGNED_OUT') {
            setSession(null)
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            return
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