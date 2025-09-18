"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Star, Upload, ExternalLink, Settings, MessageSquare, Plus, Edit, Trash2, Scissors, Loader2, Save, X, AlertCircle, Clock, DollarSign, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useStylistProfileEditor } from "@/hooks/use-stylist-profile-editor"
import { useAuth } from "@/hooks/use-auth"
import { usePortfolioUpload } from "@/hooks/use-portfolio-upload"
import { useServices } from "@/hooks/use-services"
import { useServiceImageUpload } from "@/hooks/use-service-image-upload"
import { postcodeToAreaName } from "@/lib/postcode-utils"
import { DashboardGallerySkeleton } from "@/components/ui/skeletons"

const SPECIALTY_CATEGORIES = [
  "Wigs & Weaves",
  "Braids", 
  "Locs",
  "Natural Hair",
  "Bridal Hair",
  "Silk Press"
]

export function StylistDashboard() {
  const { user } = useAuth()
  const { profile, loading, saving, error, updateProfile, updatePortfolioImages } = useStylistProfileEditor()
  const { uploadFiles, deleteImage, uploadProgress, isUploading, error: uploadError } = usePortfolioUpload()
  const { services, loading: servicesLoading, saving: servicesSaving, error: servicesError, addService, updateService, deleteService } = useServices()
  const { uploadServiceImage, uploading: imageUploading } = useServiceImageUpload()
  const [isEditing, setIsEditing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [localGalleryImages, setLocalGalleryImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadInProgressRef = useRef(false)
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 [DEBUG] hasUnsavedChanges changed to:', hasUnsavedChanges)
  }, [hasUnsavedChanges])
  
  useEffect(() => {
    console.log('🔍 [DEBUG] localGalleryImages changed to:', localGalleryImages.length, 'images')
  }, [localGalleryImages])
  
  // Initialize local gallery with profile images when profile loads
  useEffect(() => {
    if (profile?.portfolio_images) {
      console.log('🔄 [DEBUG] Profile loaded with', profile.portfolio_images.length, 'images')
      console.log('🔄 [DEBUG] Profile images:', profile.portfolio_images)
      console.log('🔄 [DEBUG] Current localGalleryImages:', localGalleryImages)
      
      // Only update local gallery if it's empty or if we have unsaved changes that need syncing
      if (localGalleryImages.length === 0 && !hasUnsavedChanges) {
        console.log('🔄 [DEBUG] Initializing localGalleryImages with profile images')
        setLocalGalleryImages(profile.portfolio_images)
      } else if (hasUnsavedChanges) {
        console.log('🔄 [DEBUG] Has unsaved changes, keeping local gallery state')
      } else {
        console.log('🔄 [DEBUG] Local gallery already has images, keeping current state')
      }
    }
  }, [profile?.portfolio_images, hasUnsavedChanges]) // Watch both portfolio images and unsaved changes
  
  // Services state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: 0,
    duration: 60
  })
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null)
  const [serviceImagePreview, setServiceImagePreview] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isServiceDragOver, setIsServiceDragOver] = useState(false)
  const serviceImageInputRef = useRef<HTMLInputElement>(null)
  
  // Form state for editing
  const [formData, setFormData] = useState({
    business_name: '',
    bio: '',
    location: '',
    specialties: '',
    years_experience: 0,
    booking_link: '',
    phone: '',
    contact_email: '',
    instagram_handle: '',
    tiktok_handle: ''
  })
  
  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      console.log('🔍 [DASHBOARD] Profile data received:', JSON.stringify(profile, null, 2))
      console.log('🔍 [DASHBOARD] Booking link value:', profile.booking_link)
      setFormData({
        business_name: profile.business_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        specialties: (profile.specialties && profile.specialties.length > 0) ? profile.specialties[0] : '',
        years_experience: profile.years_experience || 0,
        booking_link: profile.booking_link || '',
        phone: profile.phone || '',
        contact_email: profile.contact_email || '',
        instagram_handle: profile.instagram_handle || '',
        tiktok_handle: profile.tiktok_handle || ''
      })
    }
  }, [profile])
  
  const handleSave = async () => {
    if (!profile) return
    
    try {
      // Convert single specialty to array for backend
      const updateData = {
        ...formData,
        specialties: formData.specialties ? [formData.specialties] : []
      }
      await updateProfile(updateData)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
    }
  }
  
  const handleCancel = () => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        specialties: (profile.specialties && profile.specialties.length > 0) ? profile.specialties[0] : '',
        years_experience: profile.years_experience || 0,
        booking_link: profile.booking_link || '',
        phone: profile.phone || '',
        contact_email: profile.contact_email || '',
        instagram_handle: profile.instagram_handle || '',
        tiktok_handle: profile.tiktok_handle || ''
      })
    }
    setIsEditing(false)
  }
  
  const setSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: specialty
    }))
  }

  // Image upload handlers
  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    console.log('🔄 [DEBUG] handleImageUpload called with', files.length, 'files')
    console.log('🔍 [DEBUG] uploadInProgress ref:', uploadInProgressRef.current)
    
    // Prevent duplicate uploads using ref
    if (uploadInProgressRef.current) {
      console.log('⚠️ [DEBUG] Upload already in progress, skipping...')
      return
    }
    
    // Set upload in progress
    uploadInProgressRef.current = true
    
    // Convert FileList to array immediately to prevent it from becoming stale
    const filesArray = Array.from(files)
    console.log('🔄 [DEBUG] Converted to array:', filesArray.length, 'files')
    
    try {
      // Get current images count using functional update approach
      let currentImageCount = 0
      setLocalGalleryImages(currentImages => {
        currentImageCount = currentImages.length
        console.log('🔍 [DEBUG] Current localGalleryImages from state:', currentImages.length, 'images:', currentImages)
        return currentImages // Return unchanged
      })
      
      const totalImages = currentImageCount + filesArray.length
      
      if (totalImages > 20) {
        alert(`Cannot upload ${filesArray.length} images. Maximum 20 images allowed. You currently have ${currentImageCount} images.`)
        uploadInProgressRef.current = false // Reset flag
        return
      }

      console.log('🚀 [DEBUG] Starting file upload for', filesArray.length, 'files...')
      console.log('🚀 [DEBUG] Current images before upload:', currentImageCount, 'images')
      
      // Upload files
      const uploadedUrls = await uploadFiles(filesArray)
      console.log('✅ [DEBUG] Files uploaded successfully, received', uploadedUrls.length, 'URLs:', uploadedUrls)
      
      if (uploadedUrls.length > 0) {
        // Add uploaded URLs to existing images
        setLocalGalleryImages(prevImages => {
          const updatedImages = [...prevImages, ...uploadedUrls]
          console.log('🔄 [DEBUG] Combining existing', prevImages.length, 'images with', uploadedUrls.length, 'new images')
          console.log('🔄 [DEBUG] Final image array (', updatedImages.length, 'total):', updatedImages)
          
          return updatedImages
        })
        setHasUnsavedChanges(true)
        console.log('💾 [DEBUG] Local gallery updated and hasUnsavedChanges set to true')
      }
      
    } catch (err) {
      console.error('❌ [DEBUG] Upload failed:', err)
      alert('Failed to upload images. Please try again.')
    } finally {
      // Clear upload in progress flag
      uploadInProgressRef.current = false
    }
  }, [uploadFiles])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleImageUpload(files)
      // Reset the file input so users can select the same files again if needed
      if (event.target) {
        event.target.value = ''
      }
    }
  }, [handleImageUpload])

  const handleImageDelete = useCallback(async (imageUrl: string, index: number) => {
    if (!localGalleryImages.length) return
    
    try {
      console.log('🔍 [DASHBOARD] Removing image from local gallery:', imageUrl)
      const updatedImages = localGalleryImages.filter((_, i) => i !== index)
      setLocalGalleryImages(updatedImages) // Update local state only
      setHasUnsavedChanges(true) // Mark as having unsaved changes
      console.log('✅ [DASHBOARD] Image removed from local gallery!')
    } catch (err) {
      console.error('❌ [DASHBOARD] Remove failed:', err)
    }
  }, [localGalleryImages])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }, [handleImageUpload])

  const triggerFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Ensure file input is properly configured
  useEffect(() => {
    if (fileInputRef.current) {
      const input = fileInputRef.current
      // Force set attributes to ensure Chrome compatibility
      input.setAttribute('multiple', 'true')
      input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif')
      
      // Add a small delay to ensure DOM is fully ready
      setTimeout(() => {
        console.log('🔍 [DASHBOARD] File input configured - multiple:', input.multiple, 'accept:', input.accept)
      }, 100)
    }
  }, [profile])


  // Gallery reorder handlers
  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }, [])

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverImageIndex(index)
  }, [])

  const handleImageDragLeave = useCallback(() => {
    setDragOverImageIndex(null)
  }, [])

  const handleImageDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverImageIndex(null)
    
    if (draggedImageIndex === null || draggedImageIndex === dropIndex || !localGalleryImages.length) {
      setDraggedImageIndex(null)
      return
    }

    try {
      const images = [...localGalleryImages]
      const draggedImage = images[draggedImageIndex]
      
      // Remove the dragged image from its original position
      images.splice(draggedImageIndex, 1)
      
      // Insert at new position (adjust index if needed)
      const adjustedDropIndex = draggedImageIndex < dropIndex ? dropIndex - 1 : dropIndex
      images.splice(adjustedDropIndex, 0, draggedImage)
      
      console.log('🔄 [DASHBOARD] Reordering images locally:', { from: draggedImageIndex, to: dropIndex })
      setLocalGalleryImages(images) // Update local state only
      setHasUnsavedChanges(true) // Mark as having unsaved changes
      console.log('✅ [DASHBOARD] Local gallery order updated successfully')
    } catch (err) {
      console.error('❌ [DASHBOARD] Failed to reorder images:', err)
    } finally {
      setDraggedImageIndex(null)
    }
  }, [draggedImageIndex, localGalleryImages])

  const handleImageDragEnd = useCallback(() => {
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }, [])

  // Local state for optimistic UI updates
  const [optimisticActive, setOptimisticActive] = useState<boolean | null>(null)

  // Toggle profile active status with optimistic updates
  const handleToggleActiveStatus = useCallback(async (isActive: boolean) => {
    try {
      console.log('🔄 [DEBUG] Toggling profile active status to:', isActive)
      
      // Immediately update the UI optimistically
      setOptimisticActive(isActive)
      
      // Update the database in the background
      await updateProfile({ is_active: isActive })
      
      console.log('✅ [DEBUG] Profile active status updated successfully')
      
      // Clear optimistic state once real data is updated
      setOptimisticActive(null)
      
    } catch (err) {
      console.error('❌ [DEBUG] Failed to update profile active status:', err)
      
      // Revert optimistic state on error
      setOptimisticActive(null)
      
      alert('Failed to update profile status. Please try again.')
    }
  }, [updateProfile])

  // Save gallery changes to database
  const handleSaveGallery = useCallback(async () => {
    try {
      console.log('💾 [DEBUG] === SAVING GALLERY TO DATABASE ===')
      console.log('💾 [DEBUG] Current localGalleryImages:', localGalleryImages.length, 'images:', localGalleryImages)
      console.log('💾 [DEBUG] Original profile images:', profile?.portfolio_images?.length, 'images:', profile?.portfolio_images)
      console.log('💾 [DEBUG] hasUnsavedChanges:', hasUnsavedChanges)
      
      // Delete old images that are no longer in the gallery
      const originalImages = profile?.portfolio_images || []
      const imagesToDelete = originalImages.filter(img => !localGalleryImages.includes(img))
      
      if (imagesToDelete.length > 0) {
        console.log('🗑️ [DEBUG] Images to delete:', imagesToDelete.length, 'images:', imagesToDelete)
        for (const imageUrl of imagesToDelete) {
          try {
            await deleteImage(imageUrl)
            console.log('🗑️ [DEBUG] Successfully deleted image:', imageUrl)
          } catch (err) {
            console.error('❌ [DEBUG] Failed to delete image:', imageUrl, err)
          }
        }
      } else {
        console.log('🗑️ [DEBUG] No images to delete')
      }
      
      // Save the current local gallery to database
      console.log('💾 [DEBUG] Saving', localGalleryImages.length, 'images to database')
      await updatePortfolioImages(localGalleryImages)
      setHasUnsavedChanges(false)
      console.log('✅ [DEBUG] Gallery saved successfully to database, unsaved changes cleared')
      console.log('💾 [DEBUG] === GALLERY SAVE COMPLETE ===')
      
      // Show a brief success message (optional)
      // Could add a toast notification here
    } catch (err) {
      console.error('❌ [DEBUG] Failed to save gallery:', err)
      alert('Failed to save gallery. Please try again.')
    }
  }, [localGalleryImages, profile?.portfolio_images, updatePortfolioImages, deleteImage, hasUnsavedChanges])

  // Service management functions
  const openAddServiceModal = () => {
    setEditingService(null)
    setServiceForm({
      name: '',
      price: 0,
      duration: 60
    })
    setServiceImageFile(null)
    setServiceImagePreview('')
    setIsServiceDragOver(false)
    setIsServiceModalOpen(true)
  }

  const openEditServiceModal = (service: any) => {
    setEditingService(service)
    setServiceForm({
      name: service.name,
      price: service.price,
      duration: service.duration
    })
    setServiceImageFile(null)
    setServiceImagePreview(service.image_url || '')
    setIsServiceDragOver(false)
    setIsServiceModalOpen(true)
  }

  const handleServiceImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setServiceImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setServiceImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerServiceImageSelect = () => {
    serviceImageInputRef.current?.click()
  }

  // Service image drag and drop handlers
  const handleServiceDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsServiceDragOver(true)
  }, [])

  const handleServiceDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsServiceDragOver(false)
  }, [])

  const handleServiceDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsServiceDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      // Take only the first image file
      const file = files[0]
      setServiceImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setServiceImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const validateServiceForm = () => {
    if (!serviceForm.name.trim()) {
      alert('Service name is required')
      return false
    }
    if (serviceForm.price <= 0) {
      alert('Price must be greater than 0')
      return false
    }
    if (serviceForm.duration <= 0) {
      alert('Duration must be greater than 0')
      return false
    }
    return true
  }

  const handleSaveService = async () => {
    console.log('🔍 [DEBUG] handleSaveService called')
    console.log('🔍 [DEBUG] serviceForm:', serviceForm)
    
    if (!validateServiceForm()) {
      console.log('❌ [DEBUG] Form validation failed')
      return
    }

    console.log('✅ [DEBUG] Form validation passed')

    try {
      let imageUrl = serviceImagePreview
      console.log('🔍 [DEBUG] Initial imageUrl:', imageUrl)

      // Upload new image if a file is selected
      if (serviceImageFile) {
        console.log('🔍 [DEBUG] Uploading image file:', serviceImageFile.name)
        imageUrl = await uploadServiceImage(serviceImageFile)
        console.log('✅ [DEBUG] Image uploaded:', imageUrl)
      }

      const serviceData = {
        name: serviceForm.name,
        price: serviceForm.price,
        duration: serviceForm.duration,
        image_url: imageUrl || undefined
      }
      console.log('🔍 [DEBUG] Service data to save:', serviceData)

      if (editingService) {
        console.log('🔍 [DEBUG] Updating existing service:', editingService.id)
        await updateService(editingService.id, serviceData)
      } else {
        console.log('🔍 [DEBUG] Adding new service')
        const result = await addService(serviceData)
        console.log('✅ [DEBUG] Service added successfully:', result)
      }

      console.log('✅ [DEBUG] Service operation completed, closing modal')
      setIsServiceModalOpen(false)
      setServiceImageFile(null)
      setServiceImagePreview('')
      setIsServiceDragOver(false)
    } catch (err) {
      console.error('❌ [DEBUG] Error saving service:', err)
      console.error('❌ [DEBUG] Error details:', JSON.stringify(err, null, 2))
      alert(`Failed to save service: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDeleteService = (serviceId: string) => {
    setShowDeleteConfirm(serviceId)
  }

  const confirmDeleteService = async (serviceId: string) => {
    try {
      await deleteService(serviceId)
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting service:', err)
      alert('Failed to delete service. Please try again.')
    }
  }

  const formatDuration = (minutes) => {
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
  
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Loading your profile...</span>
        </div>
      </div>
    )
  }
  
  if (error && !profile) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">Error loading profile: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">No profile found.</p>
          <p className="text-sm text-gray-500">Please contact support if this error persists.</p>
        </div>
      </div>
    )
  }
  
  // Helper functions for real data with fallbacks
  const getBusinessName = () => profile.business_name || "My Hair Studio"
  const getBio = () => profile.bio || "Professional hairstylist dedicated to helping you look and feel your best."
  const getLocation = () => {
    if (profile.location) {
      // Convert postcode to area name for display
      return postcodeToAreaName(profile.location)
    }
    return "London, UK"
  }
  const getRating = () => profile.rating || 0
  const getReviewCount = () => profile.total_reviews || 0
  const getSpecialties = () => profile.specialties || []
  const getExperience = () => profile.years_experience || 0

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Welcome Header */}
      <div className="grid grid-cols-1 gap-4 mb-5">
        <div className="bg-gray-100 p-6 h-full flex flex-col justify-center">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hello {getBusinessName()}</h1>
              <Badge variant="secondary" className={`${(optimisticActive !== null ? optimisticActive : profile?.is_active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} w-fit`}>
                {profile?.is_verified ? "Verified Profile" : ((optimisticActive !== null ? optimisticActive : profile?.is_active) ? "Active Profile" : "Inactive Profile")}
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 mt-3">
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{getRating() > 0 ? getRating().toFixed(1) : "New"}</span>
                  <span className="text-gray-600 ml-1">({getReviewCount()} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Active:</span>
                  <button
                    onClick={() => handleToggleActiveStatus(!profile?.is_active)}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      (optimisticActive !== null ? optimisticActive : profile?.is_active) ? 'bg-red-600' : 'bg-gray-400'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      (optimisticActive !== null ? optimisticActive : profile?.is_active) ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/stylist/${profile.id}`}>
                <Button variant="outline" className="w-full bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      <Card className="mb-5">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-red-600" />
              Profile Information
            </CardTitle>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "" : "bg-red-600 hover:bg-red-700"}
              disabled={saving}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`${isEditing ? 'space-y-8' : 'space-y-10'} p-4 sm:p-6`}>
          {/* 1. LOGO SECTION */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Logo</h3>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={`/placeholder.svg?height=100&width=100&text=${encodeURIComponent(getBusinessName())}`} />
                <AvatarFallback>{getBusinessName().split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-sm mb-2"
                  onClick={() => {
                    // Placeholder function - will be implemented when connected to file upload
                    console.log('Change photo clicked');
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* 2. TWO COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-5">
                {/* Business Name */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Business Name <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <Input
                      value={formData.business_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                      placeholder="Your business name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{getBusinessName()}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>
                    {isEditing ? "Postcode" : "Location"}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value.toUpperCase() }))}
                      placeholder="SW1A 1AA"
                      maxLength={8}
                      pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
                      title="Please enter a valid UK postcode (e.g., SW1A 1AA)"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{getLocation()}</p>
                  )}
                </div>

                {/* Specialties */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Specialty <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <Select
                      value={formData.specialties}
                      onValueChange={setSpecialty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTY_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {formData.specialties || 'No specialty selected'}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Bio <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell clients about yourself and your services..."
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{getBio()}</p>
                  )}
                </div>

                {/* Experience and Rate */}
                {isEditing && (
                  <div>
                    <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Years of Experience</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                      placeholder="Years"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Contact Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
              <div className="space-y-5">
                {/* Booking Link */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Booking Link</label>
                  {isEditing ? (
                    <Input
                      value={formData.booking_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, booking_link: e.target.value }))}
                      placeholder="https://your-booking-site.com"
                      type="url"
                    />
                  ) : (
                    <p className="text-gray-700">
                      {profile.booking_link || 'No booking link added'}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Phone Number</label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone number"
                      type="tel"
                    />
                  ) : (
                    <p className="text-gray-700">
                      {profile.phone || 'No phone number added'}
                    </p>
                  )}
                </div>

                {/* Contact Email */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Contact Email</label>
                  {isEditing ? (
                    <Input
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="contact@yourbusiness.com"
                      type="email"
                    />
                  ) : (
                    <p className="text-gray-700">
                      {profile.contact_email || 'No contact email added'}
                    </p>
                  )}
                </div>

                {/* Instagram Handle */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>Instagram</label>
                  {isEditing ? (
                    <Input
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                      placeholder="@yourusername"
                    />
                  ) : (
                    <p className="text-gray-700">
                      {profile.instagram_handle || 'No Instagram handle added'}
                    </p>
                  )}
                </div>

                {/* TikTok Handle */}
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${isEditing ? 'mb-2' : 'mb-3'} block`}>TikTok</label>
                  {isEditing ? (
                    <Input
                      value={formData.tiktok_handle}
                      onChange={(e) => setFormData(prev => ({ ...prev, tiktok_handle: e.target.value }))}
                      placeholder="@yourusername"
                    />
                  ) : (
                    <p className="text-gray-700">
                      {profile.tiktok_handle || 'No TikTok handle added'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save/Cancel buttons */}
          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Save Changes</>
                )}
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </CardContent>
      </Card>

        {/* Gallery Settings Card */}
        <Card className="mb-5">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2 text-red-600" />
                Gallery Settings
              </CardTitle>
              {hasUnsavedChanges && (
                <Button
                  onClick={handleSaveGallery}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save Gallery
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Upload Progress</h4>
                {uploadProgress.map((progress, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate max-w-48">{progress.file.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        progress.status === 'success' ? 'bg-green-100 text-green-800' :
                        progress.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {progress.status === 'success' ? 'Complete' :
                         progress.status === 'error' ? 'Failed' :
                         'Uploading'}
                      </span>
                    </div>
                    {progress.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    )}
                    {progress.status === 'error' && progress.error && (
                      <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Errors */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}

            {/* Current Gallery */}
            <div>
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Current Gallery ({localGalleryImages.length || 0}/20)
                  </h4>
                  {localGalleryImages.length > 0 && (
                    <p className="text-xs text-gray-500 hidden sm:block">Drag images to reorder</p>
                  )}
                </div>
                {localGalleryImages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1 sm:hidden">Drag images to reorder</p>
                )}
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                {loading && !profile ? (
                  <div className="col-span-3">
                    <DashboardGallerySkeleton />
                  </div>
                ) : localGalleryImages.length ? (
                  localGalleryImages.map((imageUrl, index) => (
                    <div 
                      key={`${imageUrl}-${index}`} 
                      className={`relative group aspect-square rounded-lg overflow-hidden cursor-move transition-all duration-200 ${
                        draggedImageIndex === index ? 'opacity-50 scale-95' : ''
                      } ${
                        dragOverImageIndex === index ? 'ring-2 ring-red-400 scale-105' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleImageDragStart(e, index)}
                      onDragOver={(e) => handleImageDragOver(e, index)}
                      onDragLeave={handleImageDragLeave}
                      onDrop={(e) => handleImageDrop(e, index)}
                      onDragEnd={handleImageDragEnd}
                      title="Drag to reorder"
                    >
                      <img 
                        src={imageUrl}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover bg-gray-200 pointer-events-none"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=200&width=200&text=Error`
                        }}
                      />
                      {/* Delete button on hover */}
                      <button 
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImageDelete(imageUrl, index)
                        }}
                        disabled={isUploading || saving}
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {/* Drag handle indicator */}
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        #{index + 1}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No images uploaded yet</p>
                    <p className="text-xs">Start building your portfolio by uploading images below</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add New Images */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Add New Images</h4>
              
              {/* Unified drag and drop area with button inside */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-red-400 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-red-500' : 'text-gray-400'}`} />
                <h5 className="text-lg font-medium text-gray-900 mb-2">
                  {isDragOver ? 'Drop your images here' : 'Select Gallery Images'}
                </h5>
                <p className="text-sm text-gray-500 mb-4">
                  {isDragOver 
                    ? 'Release to stage your images for preview' 
                    : 'Drag and drop images here, or click the button below to preview before uploading'
                  }
                </p>
                
                {/* Clean file upload button */}
                <label 
                  htmlFor="portfolio-file-input"
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2 text-red-600 border-red-600 hover:bg-red-50 cursor-pointer ${
                    (isUploading || saving || localGalleryImages.length >= 20) 
                      ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                      : ''
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Select Images
                    </>
                  )}
                </label>
                
                <p className="text-xs text-gray-400 mt-3">
                  <span className="font-medium text-gray-600">Tip:</span> Images will be staged for preview first. Hold Ctrl (Windows) or Cmd (Mac) to select multiple files at once.<br/>
                  JPG, PNG or GIF. Max 5MB per image. Up to 20 images total.
                </p>
              </div>
              
              {/* Clean hidden file input */}
              <input
                id="portfolio-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
            </div>

            {/* Gallery Tips */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Gallery Tips</h5>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Upload high-quality images of your best work</li>
                <li>• Show variety in your styles and techniques</li>
                <li>• Include before and after photos when possible</li>
                <li>• Keep images well-lit and professionally shot</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      {/* Services Management */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Scissors className="w-5 h-5 mr-2 text-red-600" />
              Services
            </CardTitle>
            <Dialog open={isServiceModalOpen} onOpenChange={(open) => {
              setIsServiceModalOpen(open)
              if (!open) {
                setIsServiceDragOver(false)
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openAddServiceModal}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Service Image Upload */}
                  <div>
                    <Label>Service Image</Label>
                    <div className="mt-2">
                      {serviceImagePreview ? (
                        <div 
                          className={`flex items-center gap-4 rounded-lg border-2 border-dashed transition-colors ${
                            isServiceDragOver ? 'border-red-400 bg-red-50' : 'border-transparent'
                          }`}
                          onDragOver={handleServiceDragOver}
                          onDragLeave={handleServiceDragLeave}
                          onDrop={handleServiceDrop}
                        >
                          <img
                            src={serviceImagePreview}
                            alt="Service preview"
                            className="w-32 aspect-square object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={triggerServiceImageSelect}
                            className="bg-white/90 hover:bg-white"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Change
                          </Button>
                          {isServiceDragOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 rounded-lg">
                              <p className="text-red-600 font-medium">Drop new image</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div 
                            onDragOver={handleServiceDragOver}
                            onDragLeave={handleServiceDragLeave}
                            onDrop={handleServiceDrop}
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              isServiceDragOver 
                                ? 'border-red-400 bg-red-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${
                              isServiceDragOver ? 'text-red-500' : 'text-gray-400'
                            }`} />
                            <p className={`text-sm mb-3 ${
                              isServiceDragOver ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {isServiceDragOver ? 'Drop image here' : 'Drag and drop an image here, or click the button below'}
                            </p>
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={triggerServiceImageSelect}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Select Image
                            </Button>
                            
                            <p className="text-xs text-gray-400 mt-3">JPG, PNG or GIF. Max 5MB.</p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={serviceImageInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleServiceImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Service Name */}
                  <div>
                    <Label htmlFor="service-name">Service Name</Label>
                    <Input
                      id="service-name"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Box Braids, Silk Press"
                    />
                  </div>

                  {/* Price and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service-price">Price (£)</Label>
                      <Input
                        id="service-price"
                        type="number"
                        min="0"
                        step="1"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-duration">Duration (minutes)</Label>
                      <Input
                        id="service-duration"
                        type="number"
                        min="15"
                        step="15"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                        placeholder="60"
                      />
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSaveService}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                      disabled={!serviceForm.name || serviceForm.price <= 0 || serviceForm.duration <= 0}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingService ? 'Update Service' : 'Add Service'}
                    </Button>
                    <Button 
                      onClick={() => setIsServiceModalOpen(false)}
                      variant="outline"
                      disabled={false}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {servicesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{servicesError}</p>
            </div>
          )}
          
          {servicesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Loading services...</span>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Service Image - 1:1 aspect ratio */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={service.image_url || '/placeholder.svg?height=200&width=200&text=Service'}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg?height=200&width=200&text=Service'
                        }}
                      />
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-base">{service.name}</h4>
                        {/* Service Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditServiceModal(service)}
                            className="h-6 w-6 p-0"
                            disabled={servicesSaving}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={servicesSaving}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <span className="text-sm">{formatDuration(service.duration)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <span className="font-medium text-gray-700 text-sm">£{service.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Added</h3>
              <p className="text-gray-500 mb-4">Start by adding your first service to showcase what you offer.</p>
              <Button 
                onClick={openAddServiceModal}
                className="bg-red-600 hover:bg-red-700"
                disabled={servicesSaving}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Are you sure you want to delete this service? This action cannot be undone.</p>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => confirmDeleteService(showDeleteConfirm)}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                      disabled={servicesSaving}
                    >
                      {servicesSaving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
                      ) : (
                        'Delete Service'
                      )}
                    </Button>
                    <Button 
                      onClick={() => setShowDeleteConfirm(null)}
                      variant="outline"
                      disabled={servicesSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  )
}