"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink, Settings, MessageSquare, Edit, Scissors, Loader2, Save, AlertCircle, LayoutDashboard, User } from "lucide-react"
import Link from "next/link"
import { useStylistProfileEditor } from "@/hooks/use-stylist-profile-editor"
import { useAuth } from "@/hooks/use-auth"
import { usePortfolioUpload } from "@/hooks/use-portfolio-upload"
import { useServices } from "@/hooks/use-services"
import { postcodeToAreaName } from "@/lib/postcode-utils"
import { BusinessFormFields, BusinessFormData, ServiceItem, initialBusinessFormData } from "@/components/business-form-fields"

export function StylistDashboard() {
  const { user } = useAuth()
  const { profile, loading, saving, error, updateProfile, updatePortfolioImages } = useStylistProfileEditor()
  const { uploadFiles, deleteImage, uploadProgress, isUploading, error: uploadError } = usePortfolioUpload()
  const { services, addService, updateService, deleteService, refreshServices } = useServices()
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [localGalleryImages, setLocalGalleryImages] = useState<string[]>([])
  const uploadInProgressRef = useRef(false)
  const [profileFormData, setProfileFormData] = useState<BusinessFormData>(initialBusinessFormData)
  const [additionalServices, setAdditionalServices] = useState<string[]>([])
  const [logoImage, setLogoImage] = useState<string>('')
  const [formServices, setFormServices] = useState<ServiceItem[]>([])

  // Track gallery mutations while ensuring unsaved flag is set
  const updateGalleryImages = useCallback((updater: React.SetStateAction<string[]>) => {
    setLocalGalleryImages(prev => {
      const next = typeof updater === 'function' ? (updater as (prev: string[]) => string[])(prev) : updater
      setHasUnsavedChanges(true)
      return next
    })
  }, [])

  // Sync form state when profile loads
  useEffect(() => {
    if (!profile) return

    const resolvedYearStarted = profile.year_started
      ? String(profile.year_started)
      : profile.years_experience
        ? String(new Date().getFullYear() - profile.years_experience)
        : ''

    setProfileFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      business_name: profile.business_name || '',
      contact_email: profile.contact_email || '',
      phone: profile.phone || '',
      instagram_handle: profile.instagram_handle || '',
      tiktok_handle: profile.tiktok_handle || '',
      location: profile.location || '',
      business_type: profile.business_type || '',
      specialties: (profile.specialties && profile.specialties.length > 0) ? profile.specialties[0] : '',
      bio: profile.bio || '',
      year_started: resolvedYearStarted,
      booking_link: profile.booking_link || '',
      accepts_same_day: profile.accepts_same_day ?? null,
      accepts_mobile: profile.accepts_mobile ?? null,
    })

    if (!hasUnsavedChanges) {
        setLocalGalleryImages(profile.portfolio_images || [])
      }

    setLogoImage(profile.logo_url || '')
    setAdditionalServices(profile.additional_services || [])
    setLocalGalleryImages(profile.portfolio_images || [])
    setHasUnsavedChanges(false)
  }, [profile])

  useEffect(() => {
    setFormServices((services || []).map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      image_url: s.image_url
    })))
  }, [services])
  
  const handleSave = async () => {
    if (!profile) return
    
    try {
      const yearStartedNumber = profileFormData.year_started ? Number(profileFormData.year_started) : null
      const years_experience = yearStartedNumber
        ? Math.max(0, new Date().getFullYear() - yearStartedNumber)
        : profile.years_experience || 0

      const updateData = {
        first_name: profileFormData.first_name,
        last_name: profileFormData.last_name,
        business_name: profileFormData.business_name,
        bio: profileFormData.bio,
        location: profileFormData.location,
        specialties: profileFormData.specialties ? [profileFormData.specialties] : [],
        booking_link: profileFormData.booking_link,
        phone: profileFormData.phone,
        contact_email: profileFormData.contact_email,
        instagram_handle: profileFormData.instagram_handle,
        tiktok_handle: profileFormData.tiktok_handle,
        business_type: profileFormData.business_type,
        accepts_same_day: profileFormData.accepts_same_day,
        accepts_mobile: profileFormData.accepts_mobile,
        year_started: yearStartedNumber,
        years_experience,
        logo_url: logoImage,
        additional_services: additionalServices,
      }

      await updateProfile(updateData)

      if (hasUnsavedChanges) {
        const originalImages = profile?.portfolio_images || []
        const imagesToDelete = originalImages.filter(img => !localGalleryImages.includes(img))

        if (imagesToDelete.length > 0) {
          for (const imageUrl of imagesToDelete) {
            try {
              await deleteImage(imageUrl)
            } catch (err) {
            }
          }
        }

        await updatePortfolioImages(localGalleryImages)
        setHasUnsavedChanges(false)
      }

      const existingById = new Map(services.map(s => [s.id, s]))
      const formById = new Map(formServices.map(s => [s.id, s]))

      const servicesToDelete = services.filter(s => !formById.has(s.id))
      const servicesToAdd = formServices.filter(s => !existingById.has(s.id))
      const servicesToUpdate = formServices.filter(s => {
        const existing = existingById.get(s.id)
        if (!existing) return false
        return (
          existing.name !== s.name ||
          existing.price !== s.price ||
          existing.duration !== s.duration ||
          (existing.image_url || '') !== (s.image_url || '')
        )
      })

      for (const svc of servicesToDelete) {
        await deleteService(svc.id)
      }

      for (const svc of servicesToAdd) {
        await addService({
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          image_url: svc.image_url
        })
      }

      for (const svc of servicesToUpdate) {
        await updateService(svc.id, {
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          image_url: svc.image_url
        })
      }

      await refreshServices()

      setIsEditing(false)
    } catch (err) {
    }
  }
  
  const handleCancel = () => {
    if (profile) {
      const resetYearStarted = profile.year_started
        ? String(profile.year_started)
        : profile.years_experience
          ? String(new Date().getFullYear() - profile.years_experience)
          : ''

      setProfileFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        business_name: profile.business_name || '',
        contact_email: profile.contact_email || '',
        phone: profile.phone || '',
        instagram_handle: profile.instagram_handle || '',
        tiktok_handle: profile.tiktok_handle || '',
        location: profile.location || '',
        business_type: profile.business_type || '',
        specialties: (profile.specialties && profile.specialties.length > 0) ? profile.specialties[0] : '',
        bio: profile.bio || '',
        year_started: resetYearStarted,
        booking_link: profile.booking_link || '',
        accepts_same_day: profile.accepts_same_day ?? null,
        accepts_mobile: profile.accepts_mobile ?? null,
      })
      setLogoImage(profile.logo_url || '')
      setAdditionalServices(profile.additional_services || [])
      setLocalGalleryImages(profile.portfolio_images || [])
      setHasUnsavedChanges(false)
    }
    setIsEditing(false)
  }
  
  // Image upload handlers
  const handleImageUpload = useCallback(async (files: FileList | File[]): Promise<string[]> => {
    // Prevent duplicate uploads using ref
    if (uploadInProgressRef.current) {
      return []
    }

    // Set upload in progress
    uploadInProgressRef.current = true

    // Convert FileList to array immediately to prevent it from becoming stale
    const filesArray = Array.from(files)

    try {
      // Get current images count using functional update approach
      let currentImageCount = 0
      setLocalGalleryImages(currentImages => {
        currentImageCount = currentImages.length
        return currentImages // Return unchanged
      })

      const totalImages = currentImageCount + filesArray.length

      if (totalImages > 20) {
        alert(`Cannot upload ${filesArray.length} images. Maximum 20 images allowed. You currently have ${currentImageCount} images.`)
        uploadInProgressRef.current = false // Reset flag
        return []
      }

      // Upload files
      const uploadedUrls = await uploadFiles(filesArray)

      if (uploadedUrls.length > 0) {
        // Add uploaded URLs to existing images
        setHasUnsavedChanges(true)
        setLocalGalleryImages(prevImages => {
          const updatedImages = [...prevImages, ...uploadedUrls]

          return updatedImages
        })
      }

      return uploadedUrls

    } catch (err) {
      alert('Failed to upload images. Please try again.')
      return []
    } finally {
      // Clear upload in progress flag
      uploadInProgressRef.current = false
    }
  }, [uploadFiles])

  // Local state for optimistic UI updates
  const [optimisticActive, setOptimisticActive] = useState<boolean | null>(null)

  // Toggle profile active status with optimistic updates
  const handleToggleActiveStatus = useCallback(async (isActive: boolean) => {
    try {
      // Immediately update the UI optimistically
      setOptimisticActive(isActive)

      // Update the database in the background
      await updateProfile({ is_active: isActive })

      // Clear optimistic state once real data is updated
      setOptimisticActive(null)

    } catch (err) {
      // Revert optimistic state on error
      setOptimisticActive(null)

      alert('Failed to update profile status. Please try again.')
    }
  }, [updateProfile])

  // Save gallery changes to database
  const handleSaveGallery = useCallback(async () => {
    try {
      // Delete old images that are no longer in the gallery
      const originalImages = profile?.portfolio_images || []
      const imagesToDelete = originalImages.filter(img => !localGalleryImages.includes(img))

      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          try {
            await deleteImage(imageUrl)
          } catch (err) {
          }
        }
      }

      // Save the current local gallery to database
      await updatePortfolioImages(localGalleryImages)
      setHasUnsavedChanges(false)

      // Show a brief success message (optional)
      // Could add a toast notification here
    } catch (err) {
      alert('Failed to save gallery. Please try again.')
    }
  }, [localGalleryImages, profile?.portfolio_images, updatePortfolioImages, deleteImage, hasUnsavedChanges])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Loading your profile...</span>
        </div>
      </div>
    )
  }
  
  if (error && !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  const getRating = () => profile.average_rating || 0
  const getReviewCount = () => profile.review_count || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg px-6 py-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-xs font-semibold tracking-wider text-green-600 uppercase">
              Stylist Dashboard
            </p>
            <Badge variant="secondary" className={`${(optimisticActive !== null ? optimisticActive : profile?.is_active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {profile?.is_verified ? "Verified Profile" : ((optimisticActive !== null ? optimisticActive : profile?.is_active) ? "Active Profile" : "Inactive Profile")}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Hello, {getBusinessName()}!
          </h1>
          <div className="flex items-center flex-wrap gap-6 text-base text-green-700/80">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{getRating() > 0 ? getRating().toFixed(1) : "New"}</span>
              <span>({getReviewCount()} reviews)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">Profile Status:</span>
              <button
                onClick={() => handleToggleActiveStatus(!profile?.is_active)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  (optimisticActive !== null ? optimisticActive : profile?.is_active) ? 'bg-green-600' : 'bg-gray-400'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  (optimisticActive !== null ? optimisticActive : profile?.is_active) ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm">{(optimisticActive !== null ? optimisticActive : profile?.is_active) ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="pt-2">
            <Link href={`/stylist/${profile.id}`}>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 p-0 h-auto gap-6 flex-wrap justify-start rounded-none w-full">
          <TabsTrigger
            value="dashboard"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-green-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-green-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Your business performance and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="bg-green-600 p-3 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{getRating() > 0 ? getRating().toFixed(1) : "New"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="bg-green-600 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{getReviewCount()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="bg-green-600 p-3 rounded-full">
                    <Scissors className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Specialties</p>
                    <p className="text-2xl font-bold text-gray-900">{profile.specialties?.length || (profileFormData.specialties ? 1 : 0)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="space-y-6">
          <Card className="mb-5">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-red-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="mt-1">Use the shared form layout to update your business info, photos, and contact details.</CardDescription>
                </div>
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
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className={`${isEditing ? "" : "pointer-events-none opacity-60"} max-w-3xl`}>
                <BusinessFormFields
                  formData={profileFormData}
                  setFormData={setProfileFormData}
                  additionalServices={additionalServices}
                  setAdditionalServices={setAdditionalServices}
                  logoImage={logoImage}
                  setLogoImage={setLogoImage}
                  galleryImages={localGalleryImages}
                  setGalleryImages={updateGalleryImages}
                  services={formServices}
                  setServices={setFormServices}
                  isUploading={isUploading}
                  onUploadImages={handleImageUpload}
                  showServices={true}
                />
              </div>

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

              {isEditing && (
                <div className="flex gap-2 pt-2">
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

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
