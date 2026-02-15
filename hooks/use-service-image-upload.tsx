"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export function useServiceImageUpload() {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Only JPG, PNG, and GIF files are allowed.`
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return `File size too large. Maximum size is 5MB.`
    }

    return null
  }

  const uploadServiceImage = useCallback(async (file: File): Promise<string | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    const validation = validateFile(file)
    if (validation) {
      throw new Error(validation)
    }

    setUploading(true)
    setError(null)

    try {
      // Generate unique filename - use user.id as first folder to match RLS policy
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/services/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('stylist-portfolios') // Using same bucket as portfolio
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stylist-portfolios')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [user?.id])

  const deleteServiceImage = useCallback(async (imageUrl: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const pathSegments = url.pathname.split('/')
      const fileName = pathSegments.slice(-3).join('/') // userId/services/filename

      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('stylist-portfolios')
        .remove([fileName])

      if (deleteError) {
        throw deleteError
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [user?.id])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    uploadServiceImage,
    deleteServiceImage,
    uploading,
    error,
    clearError,
    validateFile
  }
}