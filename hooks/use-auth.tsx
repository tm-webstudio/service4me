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
        console.error('Error creating user profile:', error)
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
            console.error('Error updating stylist profile:', stylistUpdateError)
          }
        }
      }
    } catch (error) {
      console.error('Exception creating user profile:', error)
      setUserProfile(null)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      // Prevent duplicate fetches for the same user within a short timeframe
      const lastFetchKey = `lastUserFetch_${userId}`
      const lastFetchTime = sessionStorage.getItem(lastFetchKey)
      const now = Date.now()
      
      if (lastFetchTime && (now - parseInt(lastFetchTime)) < 5000) {
        return
      }

      sessionStorage.setItem(lastFetchKey, now.toString())
      
      // Check if we have a valid session first
      const { data: { session } } = await supabase.auth.getSession()
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        
        if (error.code === 'PGRST116') {
          // No profile found - try to create one from auth user data
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
      
      setUserProfile(data)
    } catch (error) {
      console.error('Exception fetching user profile:', error)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const getInitialSession = async () => {
      try {
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
        setSession(null)
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED') {
            setSession(null)
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            lastFetchedUserId.current = null
            return
          }
          
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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          setUser(null)
          setUserProfile(null)
          setSession(null)
          return
        }
      } else {
        setUser(null)
        setUserProfile(null)
        setSession(null)
        return
      }
    } catch (error) {
      console.error('Signout error:', error)
      setUser(null)
      setUserProfile(null)
      setSession(null)
    }
  }

  const getDashboardUrl = () => {
    if (!userProfile) return '/dashboard/client'
    
    switch (userProfile.role) {
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