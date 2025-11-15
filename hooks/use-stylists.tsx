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
  average_rating: number
  review_count: number
  is_verified: boolean
  is_active: boolean
  full_name: string
  email: string
  booking_link?: string
  phone?: string
  contact_email?: string
  instagram_handle?: string
  tiktok_handle?: string
  portfolio_images?: string[]
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

        // Primary approach: Use reliable API endpoint first
        try {
          const apiResponse = await fetch('/api/stylists')
          const apiData = await apiResponse.json()

          if (apiData.success && apiData.data && apiData.data.length > 0) {
            const transformedData = apiData.data.map(stylist => ({
              id: stylist.id,
              business_name: stylist.business_name,
              bio: stylist.bio,
              location: stylist.location,
              specialties: stylist.specialties || [],
              years_experience: stylist.years_experience,
              hourly_rate: stylist.hourly_rate,
              average_rating: stylist.average_rating,
              review_count: stylist.review_count,
              is_verified: stylist.is_verified,
              is_active: stylist.is_active ?? true,
              full_name: 'Professional Stylist',
              email: 'stylist@example.com',
              booking_link: stylist.booking_link,
              phone: stylist.phone,
              contact_email: stylist.contact_email,
              instagram_handle: stylist.instagram_handle,
              tiktok_handle: stylist.tiktok_handle,
              portfolio_images: stylist.portfolio_images || []
            }))

            setStylists(transformedData)
            return
          }
        } catch (apiError) {
        }

        // Fallback approach: Try direct Supabase client
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase not configured')
        }

        const { data, error } = await supabase
          .from('stylist_profiles')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          const transformedData = data.map(stylist => ({
            id: stylist.id,
            business_name: stylist.business_name,
            bio: stylist.bio,
            location: stylist.location,
            specialties: stylist.specialties || [],
            years_experience: stylist.years_experience,
            hourly_rate: stylist.hourly_rate,
            average_rating: stylist.average_rating,
            review_count: stylist.review_count,
            is_verified: stylist.is_verified,
            is_active: stylist.is_active ?? true,
            full_name: 'Professional Stylist',
            email: 'stylist@example.com',
            booking_link: stylist.booking_link,
            phone: stylist.phone,
            contact_email: stylist.contact_email,
            instagram_handle: stylist.instagram_handle,
            tiktok_handle: stylist.tiktok_handle,
            portfolio_images: stylist.portfolio_images || []
          }))

          setStylists(transformedData)
          return
        }

        // If we get here, no method worked
        throw new Error('No data available from any method')

      } catch (err) {
        // Set error instead of showing dummy data
        setStylists([])
        setError(err?.message || 'Failed to load stylists')
      } finally {
        setLoading(false)
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