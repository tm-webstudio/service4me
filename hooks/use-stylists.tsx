"use client"

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface StylistProfile {
  id: string
  business_name: string
  bio: string
  location: string
  specialties: string[]
  years_experience: number
  hourly_rate: number
  rating: number
  total_reviews: number
  is_verified: boolean
  full_name: string
  email: string
  booking_link?: string
  phone?: string
  contact_email?: string
  instagram_handle?: string
  tiktok_handle?: string
}

export function useStylists() {
  const [stylists, setStylists] = useState<StylistProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 [STYLISTS] Starting fetch at:', new Date().toISOString())
        
        // Primary approach: Use reliable API endpoint first
        console.log('🔍 [STYLISTS] Trying API endpoint (reliable method)...')
        try {
          const apiResponse = await fetch('/api/stylists')
          const apiData = await apiResponse.json()
          
          if (apiData.success && apiData.data && apiData.data.length > 0) {
            console.log('✅ [STYLISTS] API method successful:', apiData.data.length, 'stylists')
            
            const transformedData = apiData.data.map(stylist => ({
              id: stylist.id,
              business_name: stylist.business_name,
              bio: stylist.bio,
              location: stylist.location,
              specialties: stylist.specialties || [],
              years_experience: stylist.years_experience,
              hourly_rate: stylist.hourly_rate,
              rating: stylist.rating,
              total_reviews: stylist.total_reviews,
              is_verified: stylist.is_verified,
              full_name: 'Professional Stylist',
              email: 'stylist@example.com',
              booking_link: stylist.booking_link,
              phone: stylist.phone,
              contact_email: stylist.contact_email,
              instagram_handle: stylist.instagram_handle,
              tiktok_handle: stylist.tiktok_handle
            }))
            
            setStylists(transformedData)
            console.log('✅ [STYLISTS] Real data loaded successfully')
            return
          }
        } catch (apiError) {
          console.log('❌ [STYLISTS] API method failed:', apiError)
        }

        // Fallback approach: Try direct Supabase client
        if (!isSupabaseConfigured()) {
          console.log('❌ [STYLISTS] Supabase not configured')
          throw new Error('Supabase not configured')
        }

        console.log('🔍 [STYLISTS] Trying direct Supabase client as fallback...')
        const startTime = Date.now()
        
        const { data, error } = await supabase
          .from('stylist_profiles')
          .select('*')
          .order('created_at', { ascending: false })

        const queryTime = Date.now() - startTime
        console.log('🔍 [STYLISTS] Direct query completed in:', queryTime, 'ms')
        
        if (error) {
          console.log('❌ [STYLISTS] Direct Supabase client failed:', error.message)
          throw error
        }

        if (data && data.length > 0) {
          console.log('✅ [STYLISTS] Direct client successful:', data.length, 'stylists')
          
          const transformedData = data.map(stylist => ({
            id: stylist.id,
            business_name: stylist.business_name,
            bio: stylist.bio,
            location: stylist.location,
            specialties: stylist.specialties || [],
            years_experience: stylist.years_experience,
            hourly_rate: stylist.hourly_rate,
            rating: stylist.rating,
            total_reviews: stylist.total_reviews,
            is_verified: stylist.is_verified,
            full_name: 'Professional Stylist',
            email: 'stylist@example.com',
            booking_link: stylist.booking_link,
            phone: stylist.phone,
            contact_email: stylist.contact_email,
            instagram_handle: stylist.instagram_handle,
            tiktok_handle: stylist.tiktok_handle
          }))

          setStylists(transformedData)
          console.log('✅ [STYLISTS] Direct client data loaded successfully')
          return
        }

        // If we get here, no method worked
        throw new Error('No data available from any method')
        
      } catch (err) {
        console.log('❌ [STYLISTS] All methods failed:', err?.message)
        
        // Set error instead of showing dummy data
        setStylists([])
        setError(err?.message || 'Failed to load stylists')
        console.log('❌ [STYLISTS] No fallback data - showing error state')
      } finally {
        setLoading(false)
        console.log('🔍 [STYLISTS] Fetch completed at:', new Date().toISOString())
      }
    }

    fetchStylists()
  }, [])

  return { 
    stylists, 
    loading, 
    error, 
    refetch: () => {
      setLoading(true)
      setError(null)
      // Trigger useEffect by changing a dependency or call fetchStylists directly
      window.location.reload()
    }
  }
}