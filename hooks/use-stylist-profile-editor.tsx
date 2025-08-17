"use client"

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { StylistProfile } from './use-stylists'

interface ProfileUpdateData {
  business_name?: string
  bio?: string
  location?: string
  specialties?: string[]
  years_experience?: number
  hourly_rate?: number
  availability_schedule?: any
}

export function useStylistProfileEditor() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<StylistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch the current user's stylist profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 [PROFILE-EDITOR] Fetching profile for user:', user.id)
        
        // Use direct Supabase client (has access to user session)
        if (!isSupabaseConfigured()) {
          console.log('❌ [PROFILE-EDITOR] Supabase not configured')
          throw new Error('Supabase not configured')
        }

        console.log('🔍 [PROFILE-EDITOR] Trying direct Supabase client...')
        const { data, error } = await supabase
          .from('stylist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.log('❌ [PROFILE-EDITOR] Direct client failed:', error.message)
          throw error
        }

        if (data) {
          console.log('✅ [PROFILE-EDITOR] Direct client successful')
          
          const transformedData: StylistProfile = {
            id: data.id,
            business_name: data.business_name,
            bio: data.bio,
            location: data.location,
            specialties: data.specialties || [],
            years_experience: data.years_experience,
            hourly_rate: data.hourly_rate,
            rating: data.rating,
            total_reviews: data.total_reviews,
            is_verified: data.is_verified,
            full_name: data.full_name || user.user_metadata?.full_name || 'Professional Stylist',
            email: data.email || user.email || 'stylist@example.com'
          }

          setProfile(transformedData)
          console.log('✅ [PROFILE-EDITOR] Profile loaded via direct client')
          return
        }

        throw new Error('Profile not found')
        
      } catch (err) {
        console.log('❌ [PROFILE-EDITOR] Failed to fetch profile:', err?.message)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!user?.id || !profile) {
      throw new Error('Cannot update profile: user not authenticated')
    }

    setSaving(true)
    setError(null)

    try {
      console.log('🔍 [PROFILE-EDITOR] Updating profile with authenticated user:', user.id)
      console.log('🔍 [PROFILE-EDITOR] Update payload:', JSON.stringify(updates, null, 2))
      
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured')
      }

      // Check if user is authenticated in Supabase
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        console.log('❌ [PROFILE-EDITOR] User not authenticated in Supabase:', authError)
        throw new Error('User not authenticated')
      }
      
      console.log('✅ [PROFILE-EDITOR] User authenticated in Supabase:', currentUser.id)
      
      // First check current data
      const { data: beforeData, error: beforeError } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (beforeError) {
        console.log('❌ [PROFILE-EDITOR] Could not fetch current data before update:', beforeError)
      } else {
        console.log('📊 [PROFILE-EDITOR] Current data before update:', JSON.stringify(beforeData, null, 2))
      }
      
      const { data, error } = await supabase
        .from('stylist_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.log('❌ [PROFILE-EDITOR] Update failed:', error.message)
        console.log('❌ [PROFILE-EDITOR] Error details:', JSON.stringify(error, null, 2))
        throw error
      }

      if (data) {
        console.log('✅ [PROFILE-EDITOR] Update successful!')
        console.log('📊 [PROFILE-EDITOR] Updated data returned:', JSON.stringify(data, null, 2))
        
        // Verify the update by fetching again
        const { data: verifyData, error: verifyError } = await supabase
          .from('stylist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (verifyError) {
          console.log('❌ [PROFILE-EDITOR] Could not verify update:', verifyError)
        } else {
          console.log('🔍 [PROFILE-EDITOR] Verification fetch:', JSON.stringify(verifyData, null, 2))
        }
        
        // Update local state with the verified data
        setProfile(prev => prev ? { ...prev, ...updates } : prev)
        return data
      }

      throw new Error('Update failed - no data returned')
      
    } catch (err) {
      console.log('❌ [PROFILE-EDITOR] Update failed:', err?.message)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const refreshProfile = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Get fresh user data to update the full_name
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        console.log('❌ [PROFILE-EDITOR] Could not get current user for refresh')
        return
      }
      
      const { data, error } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.log('❌ [PROFILE-EDITOR] Error refreshing profile:', error.message)
        return
      }

      if (data) {
        const transformedData: StylistProfile = {
          id: data.id,
          business_name: data.business_name,
          bio: data.bio,
          location: data.location,
          specialties: data.specialties || [],
          years_experience: data.years_experience,
          hourly_rate: data.hourly_rate,
          rating: data.rating,
          total_reviews: data.total_reviews,
          is_verified: data.is_verified,
          full_name: currentUser.user_metadata?.full_name || 'Professional Stylist',
          email: data.email || currentUser.email || 'stylist@example.com'
        }

        setProfile(transformedData)
        console.log('✅ [PROFILE-EDITOR] Profile refreshed with updated name')
      }
    } catch (err) {
      console.log('❌ [PROFILE-EDITOR] Error refreshing profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    saving,
    error,
    updateProfile,
    refreshProfile
  }
}