"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

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

export interface ServiceInput {
  name: string
  price: number
  duration: number
  image_url?: string
}

export function useServices() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get stylist profile ID
  const getStylistId = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null

    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return null
    }

    return data.id
  }, [user?.id])

  // Fetch services for current stylist
  const fetchServices = useCallback(async () => {
    if (!user?.id) {
      setServices([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const stylistId = await getStylistId()
      if (!stylistId) {
        setServices([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Convert prices from pence to pounds (handle both numeric and integer types)
      const servicesWithCorrectPrices = (data || []).map(service => ({
        ...service,
        price: parseFloat(service.price) / 100
      }))
      setServices(servicesWithCorrectPrices)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }, [user?.id, getStylistId])

  // Add new service
  const addService = useCallback(async (serviceInput: ServiceInput): Promise<Service | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    setSaving(true)
    setError(null)

    try {
      const stylistId = await getStylistId()

      if (!stylistId) {
        throw new Error('Stylist profile not found')
      }

      const insertData = {
        stylist_id: stylistId,
        name: serviceInput.name,
        price: serviceInput.price * 100, // convert to pence
        duration: serviceInput.duration,
        image_url: serviceInput.image_url
      }

      const { data, error } = await supabase
        .from('services')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        throw error
      }

      const newService = {
        ...data,
        price: parseFloat(data.price) / 100 // convert back to pounds
      }

      setServices(prev => [newService, ...prev])
      return newService
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service')
      throw err
    } finally {
      setSaving(false)
    }
  }, [user?.id, getStylistId])

  // Update service
  const updateService = useCallback(async (serviceId: string, serviceInput: ServiceInput): Promise<Service | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    setSaving(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: serviceInput.name,
          price: serviceInput.price * 100, // convert to pence
          duration: serviceInput.duration,
          image_url: serviceInput.image_url
        })
        .eq('id', serviceId)
        .select()
        .single()

      if (error) {
        throw error
      }

      const updatedService = {
        ...data,
        price: parseFloat(data.price) / 100 // convert back to pounds
      }

      setServices(prev => prev.map(service => 
        service.id === serviceId ? updatedService : service
      ))

      return updatedService
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service')
      throw err
    } finally {
      setSaving(false)
    }
  }, [user?.id])

  // Delete service
  const deleteService = useCallback(async (serviceId: string): Promise<void> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) {
        throw error
      }

      setServices(prev => prev.filter(service => service.id !== serviceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
      throw err
    } finally {
      setSaving(false)
    }
  }, [user?.id])

  // Fetch services when user changes
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return {
    services,
    loading,
    saving,
    error,
    addService,
    updateService,
    deleteService,
    refreshServices: fetchServices
  }
}