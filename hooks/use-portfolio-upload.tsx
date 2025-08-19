"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './use-auth'

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function usePortfolioUpload() {
  const { user } = useAuth()
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
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

  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<string[]> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    const fileArray = Array.from(files)
    
    // Validate files
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (validation) {
        throw new Error(validation)
      }
    }

    setIsUploading(true)
    setError(null)
    
    // Initialize progress tracking
    const initialProgress: UploadProgress[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }))
    setUploadProgress(initialProgress)

    const uploadedUrls: string[] = []

    try {
      // Upload files sequentially to better track progress
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        try {
          // Generate unique filename
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          
          // Update progress to show upload starting
          setUploadProgress(prev => prev.map((p, index) => 
            index === i ? { ...p, progress: 10 } : p
          ))

          // Upload to Supabase Storage
          const { data, error: uploadError } = await supabase.storage
            .from('stylist-portfolios')
            .upload(fileName, file)

          if (uploadError) {
            throw uploadError
          }

          // Update progress to show upload complete
          setUploadProgress(prev => prev.map((p, index) => 
            index === i ? { ...p, progress: 100, status: 'success' } : p
          ))

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('stylist-portfolios')
            .getPublicUrl(fileName)

          uploadedUrls.push(publicUrl)

        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError)
          
          // Update progress to show error
          setUploadProgress(prev => prev.map((p, index) => 
            index === i ? { 
              ...p, 
              status: 'error', 
              error: fileError instanceof Error ? fileError.message : 'Upload failed'
            } : p
          ))
        }
      }

      return uploadedUrls

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress([])
      }, 3000)
    }
  }, [user?.id])

  const deleteImage = useCallback(async (imageUrl: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const pathSegments = url.pathname.split('/')
      const fileName = pathSegments[pathSegments.length - 1]
      const fullPath = `${user.id}/${fileName}`

      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('stylist-portfolios')
        .remove([fullPath])

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
    uploadFiles,
    deleteImage,
    uploadProgress,
    isUploading,
    error,
    clearError,
    validateFile
  }
}