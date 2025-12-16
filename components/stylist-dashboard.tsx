"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink, Settings, MessageSquare, Scissors, Loader2, Save, AlertCircle, LayoutDashboard, User, XCircle, X } from "lucide-react"
import Link from "next/link"
import { useStylistProfileEditor } from "@/hooks/use-stylist-profile-editor"
import { useAuth } from "@/hooks/use-auth"
import { usePortfolioUpload } from "@/hooks/use-portfolio-upload"
import { useServices } from "@/hooks/use-services"
import { postcodeToAreaName } from "@/lib/postcode-utils"
import { BusinessFormFields, BusinessFormData, ServiceItem, initialBusinessFormData } from "@/components/business-form-fields"
import { StarDisplay } from "@/components/ui/star-rating"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { ReviewsDisplay } from "@/components/reviews-display"
import { DashboardHero } from "@/components/ui/dashboard-hero"
import { SectionHeader } from "@/components/ui/section-header"

export function StylistDashboard() {
  const { user } = useAuth()
  const { profile, loading, saving, error, updateProfile, updatePortfolioImages } = useStylistProfileEditor()
  const { uploadFiles, deleteImage, uploadProgress, isUploading, error: uploadError } = usePortfolioUpload()
  const { services, addService, updateService, deleteService, refreshServices } = useServices()
  const [formDirty, setFormDirty] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [localGalleryImages, setLocalGalleryImages] = useState<string[]>([])
  const uploadInProgressRef = useRef(false)
  const [profileFormData, setProfileFormData] = useState<BusinessFormData>(initialBusinessFormData)
  const [additionalServices, setAdditionalServices] = useState<string[]>([])
  const [logoImage, setLogoImage] = useState<string>('')
  const [formServices, setFormServices] = useState<ServiceItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const updateProfileFormData = (updater: React.SetStateAction<BusinessFormData>) => {
    setFormDirty(true)
    setProfileFormData(prev => typeof updater === 'function'
      ? (updater as (prev: BusinessFormData) => BusinessFormData)(prev)
      : updater
    )
  }
  const updateAdditionalServices = (updater: React.SetStateAction<string[]>) => {
    setFormDirty(true)
    setAdditionalServices(prev => typeof updater === 'function'
      ? (updater as (prev: string[]) => string[])(prev)
      : updater
    )
  }
  const updateLogoImage = (updater: React.SetStateAction<string>) => {
    setFormDirty(true)
    setLogoImage(prev => typeof updater === 'function'
      ? (updater as (prev: string) => string)(prev)
      : updater
    )
  }
  const updateFormServices = (updater: React.SetStateAction<ServiceItem[]>) => {
    setFormDirty(true)
    setFormServices(prev => typeof updater === 'function'
      ? (updater as (prev: ServiceItem[]) => ServiceItem[])(prev)
      : updater
    )
  }

  // Track gallery mutations while ensuring unsaved flag is set
  const updateGalleryImages = useCallback((updater: React.SetStateAction<string[]>) => {
    setLocalGalleryImages(prev => {
      const next = typeof updater === 'function' ? (updater as (prev: string[]) => string[])(prev) : updater
      setHasUnsavedChanges(true)
      setFormDirty(true)
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
    setFormDirty(false)
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

    setIsSaving(true)
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

      setFormDirty(false)
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
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
    setFormDirty(false)
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

  // Local state for optimistic UI updates and toggle loading
  const [optimisticActive, setOptimisticActive] = useState<boolean | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  // Toggle profile active status with optimistic updates
  const handleToggleActiveStatus = async (newActiveState: boolean) => {
    if (!profile || isToggling) return

    setIsToggling(true)
    try {
      // Immediately update the UI optimistically
      setOptimisticActive(newActiveState)

      // Update the database (this also updates local profile state)
      await updateProfile({ is_active: newActiveState })

      // Clear optimistic state - profile state is already updated by updateProfile
      setOptimisticActive(null)

    } catch (err) {
      // Revert optimistic state on error
      setOptimisticActive(null)
      alert('Failed to update profile status. Please try again.')
    } finally {
      setIsToggling(false)
    }
  }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Loading your profile...</span>
        </div>
      </div>
    )
  }
  
  if (error && !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
  const isActive = optimisticActive !== null ? optimisticActive : profile?.is_active

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <DashboardHero
        eyebrow="Stylist Dashboard"
        eyebrowClassName="text-blue-600"
        title={<>Hello, {getBusinessName()}!</>}
        gradientFrom="from-blue-50"
        gradientTo="to-indigo-50"
        borderClassName="border-blue-100"
      >
        <div className="flex items-center flex-wrap gap-6 text-sm sm:text-base text-blue-700/80">
          <StarDisplay
            rating={getRating()}
            totalReviews={getReviewCount()}
            size="sm"
            showReviewsLabel
            className="[&_span]:text-blue-700/80"
          />
        </div>
        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <Link href={`/stylist/${profile.id}`}>
            <SmallCtaButton
              variant="outline"
              className="border-blue-600 text-blue-700 hover:bg-blue-50 bg-transparent h-8 px-3 text-xs"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Profile
            </SmallCtaButton>
          </Link>
          <Badge
            variant="secondary"
            className={`${isActive ? 'bg-green-600 text-white' : 'bg-red-100 text-red-800'}`}
          >
            {profile?.is_verified ? "Verified Profile" : (isActive ? "Active Profile" : "Inactive Profile")}
          </Badge>
        </div>
      </DashboardHero>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 p-0 h-auto gap-4 sm:gap-6 flex-nowrap overflow-x-auto whitespace-nowrap justify-start rounded-none w-full -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger
            value="dashboard"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <SectionHeader
              title="Recent Reviews"
              description="Your latest ratings and feedback"
            />
            <CardContent>
              <ReviewsDisplay stylistId={profile.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="space-y-6">
          <Card className="mb-5">
            <SectionHeader
              title="Profile Information"
              description="Use the shared form layout to update your business info, photos, and contact details."
            >
              <div className="flex items-center gap-2 text-sm mt-4">
                <span className="font-medium text-gray-900 whitespace-nowrap">Profile Status:</span>
                <button
                  type="button"
                  onClick={() => handleToggleActiveStatus(!isActive)}
                  disabled={isToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    isActive ? 'bg-green-600' : 'bg-gray-400'
                  } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-sm">{isToggling ? 'Updating...' : (isActive ? 'Active' : 'Inactive')}</span>
              </div>
            </SectionHeader>
            <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6 space-y-5">
              <div className="max-w-3xl">
                <BusinessFormFields
                  formData={profileFormData}
                  setFormData={updateProfileFormData}
                  additionalServices={additionalServices}
                  setAdditionalServices={updateAdditionalServices}
                  logoImage={logoImage}
                  setLogoImage={updateLogoImage}
                  galleryImages={localGalleryImages}
                  setGalleryImages={updateGalleryImages}
                  services={formServices}
                  setServices={updateFormServices}
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}

              {(formDirty || hasUnsavedChanges) && (
                <div className="max-w-3xl pt-4 border-t">
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-blue-900 leading-tight">Save Changes</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Save your profile updates for <span className="font-semibold">{getBusinessName()}</span>.
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Editing
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      size="sm"
                      className="w-full text-sm bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" />Save Changes</>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                      size="sm"
                      className="w-full text-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
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
