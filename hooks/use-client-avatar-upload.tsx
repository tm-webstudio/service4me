"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './use-auth'

interface UploadProgress {
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

export function useClientAvatarUpload() {
  const { user } = useAuth()
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  })
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Only JPG, PNG, GIF, WEBP, and HEIC files are allowed.`
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return `File size too large. Maximum size is 5MB.`
    }

    return null
  }

  const uploadAvatar = useCallback(async (file: File, userId?: string): Promise<string> => {
    const targetUserId = userId || user?.id

    if (!targetUserId) {
      throw new Error('User not authenticated')
    }

    // Validate file
    const validation = validateFile(file)
    if (validation) {
      throw new Error(validation)
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress({ progress: 10, status: 'uploading' })

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${targetUserId}/avatar-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('client-avatars')
        .upload(fileName, file, {
          upsert: true // Overwrite if exists
        })

      if (uploadError) {
        throw uploadError
      }

      setUploadProgress({ progress: 80, status: 'uploading' })

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-avatars')
        .getPublicUrl(fileName)

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', targetUserId)

      if (updateError) {
        throw updateError
      }

      setUploadProgress({ progress: 100, status: 'success' })

      return publicUrl

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setUploadProgress({ progress: 0, status: 'error', error: errorMessage })
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({ progress: 0, status: 'idle' })
      }, 3000)
    }
  }, [user?.id])

  const deleteAvatar = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id

    if (!targetUserId) {
      throw new Error('User not authenticated')
    }

    try {
      // List files in user's avatar folder
      const { data: files, error: listError } = await supabase.storage
        .from('client-avatars')
        .list(targetUserId)

      if (listError) {
        throw listError
      }

      // Delete all avatar files for this user
      if (files && files.length > 0) {
        const filePaths = files.map(file => `${targetUserId}/${file.name}`)
        const { error: deleteError } = await supabase.storage
          .from('client-avatars')
          .remove(filePaths)

        if (deleteError) {
          throw deleteError
        }
      }

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', targetUserId)

      if (updateError) {
        throw updateError
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
    uploadAvatar,
    deleteAvatar,
    uploadProgress,
    isUploading,
    error,
    clearError,
    validateFile
  }
}
