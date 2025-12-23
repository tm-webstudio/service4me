"use client"

import { useState, useEffect, useRef } from 'react'
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
  booking_link?: string
  phone?: string
  contact_email?: string
  instagram_handle?: string
  tiktok_handle?: string
  portfolio_images?: string[]
  is_active?: boolean
  // Additional fields
  first_name?: string
  last_name?: string
  business_type?: string
  year_started?: number | null
  accepts_same_day?: boolean | null
  accepts_mobile?: boolean | null
  logo_url?: string
  additional_services?: string[]
}

export function useStylistProfileEditor() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<StylistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchedUserId = useRef<string | null>(null)

  // Fetch the current user's stylist profile
  useEffect(() => {
    const fetchProfile = async () => {
      console.log('🔧 [PROFILE-EDITOR] fetchProfile called', { userId: user?.id })

      if (!user?.id) {
        console.log('⚠️ [PROFILE-EDITOR] No user.id, setting loading to false')
        setLoading(false)
        lastFetchedUserId.current = null
        return
      }

      // Skip if we already fetched for this user (prevents duplicate fetches on re-renders)
      // But always fetch on first load for this user
      if (lastFetchedUserId.current === user.id && profile) {
        console.log('✅ [PROFILE-EDITOR] Already have profile for user, skipping fetch:', user.id)
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
          console.log('🔍 [PROFILE-EDITOR] Raw data from database:', JSON.stringify(data, null, 2))
          
          const transformedData: StylistProfile = {
            id: data.id,
            business_name: data.business_name,
            bio: data.bio,
            location: data.location,
            specialties: data.specialties || [],
            years_experience: data.years_experience,
            hourly_rate: data.hourly_rate,
            average_rating: data.average_rating,
            review_count: data.review_count,
            is_verified: data.is_verified,
            is_active: data.is_active ?? true,
            full_name: data.full_name || user.user_metadata?.full_name || 'Professional Stylist',
            email: data.email || user.email || 'stylist@example.com',
            booking_link: data.booking_link,
            phone: data.phone,
            contact_email: data.contact_email,
            instagram_handle: data.instagram_handle,
            tiktok_handle: data.tiktok_handle,
            portfolio_images: data.portfolio_images || [],
            // Additional fields
            first_name: data.first_name,
            last_name: data.last_name,
            business_type: data.business_type,
            year_started: data.year_started,
            accepts_same_day: data.accepts_same_day,
            accepts_mobile: data.accepts_mobile,
            logo_url: data.logo_url,
            additional_services: data.additional_services || []
          }

          setProfile(transformedData)
          lastFetchedUserId.current = user.id
          console.log('✅ [PROFILE-EDITOR] Profile loaded via direct client')
          return
        }

        throw new Error('Profile not found')

      } catch (err: any) {
        console.error('❌ [PROFILE-EDITOR] Failed to fetch profile:', err?.message)
        setError('Failed to load profile data')
        lastFetchedUserId.current = null // Reset on error so we can retry
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
      
    } catch (err: any) {
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
          average_rating: data.average_rating,
          review_count: data.review_count,
          is_verified: data.is_verified,
          is_active: data.is_active ?? true,
          full_name: currentUser.user_metadata?.full_name || 'Professional Stylist',
          email: data.email || currentUser.email || 'stylist@example.com',
          booking_link: data.booking_link,
          phone: data.phone,
          contact_email: data.contact_email,
          instagram_handle: data.instagram_handle,
          tiktok_handle: data.tiktok_handle,
          portfolio_images: data.portfolio_images || [],
          // Additional fields
          first_name: data.first_name,
          last_name: data.last_name,
          business_type: data.business_type,
          year_started: data.year_started,
          accepts_same_day: data.accepts_same_day,
          accepts_mobile: data.accepts_mobile,
          logo_url: data.logo_url,
          additional_services: data.additional_services || []
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

  const updatePortfolioImages = async (portfolioImages: string[]) => {
    console.log('🔍 [PROFILE-EDITOR] updatePortfolioImages called with:', portfolioImages.length, 'images')
    console.log('🔍 [PROFILE-EDITOR] Current user for portfolio update:', user?.id)
    
    if (!user?.id) {
      console.log('❌ [PROFILE-EDITOR] User not authenticated for portfolio update')
      throw new Error('Cannot update portfolio images: user not authenticated')
    }

    try {
      console.log('🔍 [PROFILE-EDITOR] Updating portfolio images directly...')
      
      const { data, error } = await supabase
        .from('stylist_profiles')
        .update({ portfolio_images: portfolioImages })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.log('❌ [PROFILE-EDITOR] Portfolio images update failed:', error.message)
        throw error
      }

      if (data) {
        console.log('✅ [PROFILE-EDITOR] Portfolio images updated successfully!')
        // Update local state immediately
        setProfile(prev => prev ? { ...prev, portfolio_images: portfolioImages } : prev)
        return data
      }

      throw new Error('Portfolio images update failed - no data returned')
      
    } catch (err: any) {
      console.log('❌ [PROFILE-EDITOR] Portfolio images update failed:', err?.message)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update portfolio images'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    profile,
    loading,
    saving,
    error,
    updateProfile,
    updatePortfolioImages,
    refreshProfile
  }
}