"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Service {
  id: string
  stylist_id: string
  name: string
  price: number // in pence
  duration: number // in minutes
  image_url?: string
  created_at: string
  updated_at: string
}

export function useStylistServices(stylistId: string | undefined) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!stylistId) {
      setServices([])
      setLoading(false)
      return
    }

    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('stylist_id', stylistId)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        // Convert price from pence to pounds for display
        const servicesWithPriceConversion = (data || []).map(service => ({
          ...service,
          price: service.price / 100
        }))

        setServices(servicesWithPriceConversion)
      } catch (err) {
        console.error('Error fetching services:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch services')
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [stylistId])

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  return {
    services,
    loading,
    error,
    formatDuration
  }
}