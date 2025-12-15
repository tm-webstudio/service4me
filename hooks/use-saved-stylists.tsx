"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

// Hook for single stylist (used in profile page)
export function useSavedStylists(stylistId?: string) {
  const { userProfile } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if the stylist is already saved
  const checkIfSaved = useCallback(async () => {
    if (!isSupabaseConfigured() || !userProfile?.id || !stylistId) {
      setChecking(false)
      return
    }

    try {
      setChecking(true)
      const { data, error } = await supabase
        .from('saved_stylists')
        .select('id')
        .eq('client_id', userProfile.id)
        .eq('stylist_id', stylistId)
        .maybeSingle()

      if (error) {
        // Table might not exist yet
        if (error.message?.includes('could not find the table')) {
          setIsSaved(false)
          return
        }
        console.error('Error checking saved status:', error)
        return
      }

      setIsSaved(!!data)
    } catch (err) {
      console.error('Error checking saved status:', err)
    } finally {
      setChecking(false)
    }
  }, [userProfile?.id, stylistId])

  useEffect(() => {
    checkIfSaved()
  }, [checkIfSaved])

  const toggleSave = useCallback(async () => {
    if (!isSupabaseConfigured() || !userProfile?.id || !stylistId) {
      return { success: false, error: 'Not authenticated or Supabase not configured' }
    }

    setLoading(true)

    try {
      if (isSaved) {
        // Unsave the stylist
        const { error } = await supabase
          .from('saved_stylists')
          .delete()
          .eq('client_id', userProfile.id)
          .eq('stylist_id', stylistId)

        if (error) throw error

        setIsSaved(false)
        return { success: true, saved: false }
      } else {
        // Save the stylist
        const { error } = await supabase
          .from('saved_stylists')
          .insert({
            client_id: userProfile.id,
            stylist_id: stylistId
          })

        if (error) throw error

        setIsSaved(true)
        return { success: true, saved: true }
      }
    } catch (err: any) {
      console.error('Error toggling save:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [isSaved, userProfile?.id, stylistId])

  const saveStylist = useCallback(async () => {
    if (isSaved) return { success: true, saved: true }
    return toggleSave()
  }, [isSaved, toggleSave])

  const unsaveStylist = useCallback(async () => {
    if (!isSaved) return { success: true, saved: false }
    return toggleSave()
  }, [isSaved, toggleSave])

  return {
    isSaved,
    loading,
    checking,
    toggleSave,
    saveStylist,
    unsaveStylist,
    isAuthenticated: !!userProfile?.id,
    isConfigured: isSupabaseConfigured()
  }
}

// Hook for multiple stylists (used in grid/browse pages)
export function useSavedStylistIds() {
  const { userProfile } = useAuth()
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Fetch all saved stylist IDs for the current user
  const fetchSavedIds = useCallback(async () => {
    if (!isSupabaseConfigured() || !userProfile?.id) {
      setLoading(false)
      setSavedIds([])
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('saved_stylists')
        .select('stylist_id')
        .eq('client_id', userProfile.id)

      if (error) {
        if (error.message?.includes('could not find the table')) {
          setSavedIds([])
          return
        }
        console.error('Error fetching saved stylists:', error)
        return
      }

      setSavedIds((data || []).map(item => item.stylist_id))
    } catch (err) {
      console.error('Error fetching saved stylists:', err)
    } finally {
      setLoading(false)
    }
  }, [userProfile?.id])

  useEffect(() => {
    fetchSavedIds()
  }, [fetchSavedIds])

  const toggleSave = useCallback(async (stylistId: string) => {
    if (!isSupabaseConfigured() || !userProfile?.id) {
      return { success: false, error: 'Not authenticated or Supabase not configured' }
    }

    setSavingId(stylistId)
    const isSaved = savedIds.includes(stylistId)

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_stylists')
          .delete()
          .eq('client_id', userProfile.id)
          .eq('stylist_id', stylistId)

        if (error) throw error

        setSavedIds(prev => prev.filter(id => id !== stylistId))
        return { success: true, saved: false }
      } else {
        const { error } = await supabase
          .from('saved_stylists')
          .insert({
            client_id: userProfile.id,
            stylist_id: stylistId
          })

        if (error) throw error

        setSavedIds(prev => [...prev, stylistId])
        return { success: true, saved: true }
      }
    } catch (err: any) {
      console.error('Error toggling save:', err)
      return { success: false, error: err.message }
    } finally {
      setSavingId(null)
    }
  }, [savedIds, userProfile?.id])

  const isSaved = useCallback((stylistId: string) => {
    return savedIds.includes(stylistId)
  }, [savedIds])

  return {
    savedIds,
    loading,
    savingId,
    toggleSave,
    isSaved,
    refetch: fetchSavedIds,
    isAuthenticated: !!userProfile?.id,
    isConfigured: isSupabaseConfigured()
  }
}
