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
import { Star, Upload, ExternalLink, Settings, MessageSquare, Plus, Edit, Trash2, Scissors, Loader2, Save, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useStylistProfileEditor } from "@/hooks/use-stylist-profile-editor"
import { useAuth } from "@/hooks/use-auth"
import { usePortfolioUpload } from "@/hooks/use-portfolio-upload"

const SPECIALTY_CATEGORIES = [
  "Wigs & Weaves",
  "Braids", 
  "Locs",
  "Natural Hair",
  "Bridal Hair",
  "Silk Press",
  "Protective Styles",
  "Twists",
  "Blowouts",
  "Hair Styling",
  "Maintenance"
]

export function StylistDashboard() {
  const { user } = useAuth()
  const { profile, loading, saving, error, updateProfile, updatePortfolioImages } = useStylistProfileEditor()
  const { uploadFiles, deleteImage, uploadProgress, isUploading, error: uploadError } = usePortfolioUpload()
  const [isEditing, setIsEditing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state for editing
  const [formData, setFormData] = useState({
    business_name: '',
    bio: '',
    location: '',
    specialties: '',
    years_experience: 0,
    hourly_rate: 0,
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
        hourly_rate: profile.hourly_rate || 0,
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
        hourly_rate: profile.hourly_rate || 0,
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
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleImageUpload(files)
      // Reset the file input so users can select the same files again if needed
      if (event.target) {
        event.target.value = ''
      }
    }
  }, [])

  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    try {
      console.log('🔍 [DASHBOARD] handleImageUpload called with', files.length, 'files')
      console.log('🔍 [DASHBOARD] Current user:', user?.id)
      console.log('🔍 [DASHBOARD] Current profile loaded:', !!profile)
      
      const currentImages = profile?.portfolio_images || []
      const totalImages = currentImages.length + files.length
      
      if (totalImages > 20) {
        alert(`Cannot upload ${files.length} images. Maximum 20 images allowed. You currently have ${currentImages.length} images.`)
        return
      }

      console.log('🔍 [DASHBOARD] Starting file upload...')
      const uploadedUrls = await uploadFiles(files)
      console.log('🔍 [DASHBOARD] Files uploaded successfully:', uploadedUrls.length, 'URLs')
      
      if (uploadedUrls.length > 0) {
        const updatedImages = [...currentImages, ...uploadedUrls]
        console.log('🔍 [DASHBOARD] Updating portfolio images in database...')
        await updatePortfolioImages(updatedImages)
        console.log('✅ [DASHBOARD] Portfolio images updated successfully!')
      }
    } catch (err) {
      console.error('❌ [DASHBOARD] Upload failed:', err)
    }
  }, [profile?.portfolio_images, uploadFiles, updatePortfolioImages, user?.id, profile])

  const handleImageDelete = useCallback(async (imageUrl: string, index: number) => {
    if (!profile?.portfolio_images) return
    
    try {
      console.log('🔍 [DASHBOARD] Deleting image:', imageUrl)
      await deleteImage(imageUrl)
      const updatedImages = profile.portfolio_images.filter((_, i) => i !== index)
      console.log('🔍 [DASHBOARD] Updating portfolio after deletion...')
      await updatePortfolioImages(updatedImages)
      console.log('✅ [DASHBOARD] Image deleted successfully!')
    } catch (err) {
      console.error('❌ [DASHBOARD] Delete failed:', err)
    }
  }, [profile?.portfolio_images, deleteImage, updatePortfolioImages])

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

  // Ensure multiple attribute is properly set
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('multiple', 'true')
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
    
    if (draggedImageIndex === null || draggedImageIndex === dropIndex || !profile?.portfolio_images) {
      setDraggedImageIndex(null)
      return
    }

    try {
      const images = [...profile.portfolio_images]
      const draggedImage = images[draggedImageIndex]
      
      // Remove the dragged image from its original position
      images.splice(draggedImageIndex, 1)
      
      // Insert at new position (adjust index if needed)
      const adjustedDropIndex = draggedImageIndex < dropIndex ? dropIndex - 1 : dropIndex
      images.splice(adjustedDropIndex, 0, draggedImage)
      
      console.log('🔄 [DASHBOARD] Reordering images:', { from: draggedImageIndex, to: dropIndex })
      await updatePortfolioImages(images)
      console.log('✅ [DASHBOARD] Gallery order updated successfully')
    } catch (err) {
      console.error('❌ [DASHBOARD] Failed to reorder images:', err)
    } finally {
      setDraggedImageIndex(null)
    }
  }, [draggedImageIndex, profile?.portfolio_images, updatePortfolioImages])

  const handleImageDragEnd = useCallback(() => {
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }, [])
  
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
  const getLocation = () => profile.location || "London, UK"
  const getRating = () => profile.rating || 0
  const getReviewCount = () => profile.total_reviews || 0
  const getSpecialties = () => profile.specialties || []
  const getExperience = () => profile.years_experience || 0
  const getHourlyRate = () => profile.hourly_rate || 50

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Welcome Header */}
      <div className="grid grid-cols-1 gap-4 mb-5">
        <div className="bg-gray-100 rounded-xl p-6 h-full flex flex-col justify-center">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hello {getBusinessName()}</h1>
            <div className="flex flex-col space-y-2 mt-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{getRating() > 0 ? getRating().toFixed(1) : "New"}</span>
                <span className="text-gray-600 ml-1">({getReviewCount()} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {profile.is_verified ? "Verified Profile" : "Active Profile"}
                </Badge>
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

      {/* Profile Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
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
          <CardContent className="space-y-8">
            {/* 1. LOGO SECTION */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Logo</h3>
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

            {/* 2. BASIC INFORMATION SECTION */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
              <div className="space-y-5">
                {/* Business Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Business Name</label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{getLocation()}</p>
                  )}
                </div>

                {/* Specialties */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Specialty</label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Bio</label>
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
              </div>
            </div>

            {/* 3. CONTACT DETAILS SECTION */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Details</h3>
              <div className="space-y-5">
                {/* Booking Link */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Booking Link</label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Contact Email</label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Instagram</label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">TikTok</label>
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

            {/* Experience and Rate */}
            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                    placeholder="Years"
                  />
                </div>
                <div>
                  <Label htmlFor="hourly-rate" className="text-sm font-medium">Hourly Rate (£)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    min="0"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) || 0 }))}
                    placeholder="Rate"
                  />
                </div>
              </div>
            )}

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2 text-red-600" />
              Gallery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  Current Gallery ({profile?.portfolio_images?.length || 0}/20)
                </h4>
                {profile?.portfolio_images?.length ? (
                  <p className="text-xs text-gray-500">Drag images to reorder</p>
                ) : null}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {profile?.portfolio_images?.length ? (
                  profile.portfolio_images.map((imageUrl, index) => (
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
                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No images uploaded yet</p>
                    <p className="text-xs">Start building your portfolio by uploading images below</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add New Images */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Add New Images</h4>
              
              {/* Drag and drop area - separate from button */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-red-400 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-red-500' : 'text-gray-400'}`} />
                <h5 className="text-sm font-medium text-gray-900 mb-1">Upload Gallery Images</h5>
                <p className="text-xs text-gray-500 mb-3">
                  {isDragOver ? 'Drop your images here' : 'Drag and drop images here or use the button below'}
                </p>
              </div>
              
              {/* Button outside the drag area to prevent conflicts */}
              <div className="mt-4 text-center">
                <label 
                  htmlFor="portfolio-file-input"
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-red-600 border-red-600 hover:bg-red-50 cursor-pointer ${
                    (isUploading || saving || (profile?.portfolio_images?.length || 0) >= 20) 
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
                    'Choose Multiple Files'
                  )}
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  <span className="font-medium text-gray-600">Tip:</span> Hold Ctrl (Windows) or Cmd (Mac) to select multiple files at once.<br/>
                  JPG, PNG or GIF. Max 5MB per image. Up to 20 images total.
                </p>
              </div>
              
              {/* Hidden file input */}
              <input
                id="portfolio-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
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
      </div>


      {/* Services placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scissors className="w-5 h-5 mr-2 text-red-600" />
            Services & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Services Coming Soon</h3>
            <p className="text-gray-500">Service management and pricing tools will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}