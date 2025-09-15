"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Plus, User, MapPin, Upload, Scissors, Edit, Trash2, Settings, Save, Loader2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { usePortfolioUpload } from "@/hooks/use-portfolio-upload"
import { useAuth } from "@/hooks/use-auth"

const SPECIALTY_CATEGORIES = [
  "Wigs & Weaves",
  "Braids", 
  "Locs",
  "Natural Hair",
  "Bridal Hair",
  "Silk Press"
]

// Mock data for pending stylists
const pendingStylists = [
  {
    id: 1,
    name: "Zara Mitchell",
    businessName: "Natural Beauty Studio",
    email: "zara.mitchell@email.com",
    phone: "+44 7123 456789",
    location: "North London",
    specialties: ["Natural Hair", "Protective Styles"],
    experience: "8 years",
    bio: "Specializing in natural hair care and protective styling. I believe in enhancing your natural beauty while maintaining hair health.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
  {
    id: 2,
    name: "Amara Okafor",
    businessName: "Braids & Beyond",
    email: "amara.okafor@email.com",
    phone: "+44 7987 654321",
    location: "South London",
    specialties: ["Braids", "Twists"],
    experience: "6 years",
    bio: "Expert in intricate braiding techniques and twist styles. Creating beautiful, long-lasting protective styles for all hair types.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
  {
    id: 3,
    name: "Keisha Williams",
    businessName: "Loc Love Salon",
    email: "keisha.williams@email.com",
    phone: "+44 7456 123789",
    location: "East London",
    specialties: ["Locs", "Maintenance"],
    experience: "10 years",
    bio: "Loc specialist with over a decade of experience. From starter locs to maintenance and styling, I've got you covered.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
  {
    id: 4,
    name: "Nia Thompson",
    businessName: "Silk & Shine",
    email: "nia.thompson@email.com",
    phone: "+44 7789 456123",
    location: "West London",
    specialties: ["Silk Press", "Blowouts"],
    experience: "7 years",
    bio: "Master of the silk press technique. Achieving smooth, sleek styles while maintaining hair health and integrity.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
]

export function AdminDashboard() {
  console.log('📊 [ADMIN-DASHBOARD] AdminDashboard component is rendering...')
  const { user } = useAuth()
  const [stylists, setStylists] = useState(pendingStylists)
  const [isAddingService, setIsAddingService] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Portfolio upload hook for handling real file uploads
  const { uploadFiles, deleteImage, uploadProgress: portfolioProgress, isUploading: portfolioUploading, error: portfolioError } = usePortfolioUpload()
  
  // File upload refs and state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const serviceImageInputRef = useRef<HTMLInputElement>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<{file: File, progress: number, status: string}[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  // Drag and drop state for gallery reordering
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Form state for creating new stylist - matches stylist dashboard form
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

  // Admin upload function that uses authenticated user for RLS compliance
  const adminUploadFiles = useCallback(async (files: FileList | File[]): Promise<string[]> => {
    if (!user?.id) {
      throw new Error('Admin must be authenticated to upload files')
    }

    const fileArray = Array.from(files)
    const uploadedUrls: string[] = []
    
    try {
      for (const file of fileArray) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Only JPG, PNG, and GIF files are allowed.`)
        }
        
        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          throw new Error(`File size too large: ${file.name}. Maximum size is 5MB.`)
        }
        
        // Generate unique filename using user ID (for RLS compliance)
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('stylist-portfolios')
          .upload(fileName, file)
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('stylist-portfolios')
          .getPublicUrl(fileName)
        
        uploadedUrls.push(publicUrl)
        console.log(`✅ Admin uploaded: ${file.name} -> ${publicUrl}`)
      }
      
      return uploadedUrls
    } catch (error) {
      console.error('Admin upload failed:', error)
      throw error
    }
  }, [user?.id])

  const handleApprove = (id: number) => {
    setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
    // In a real app, this would make an API call to approve the stylist
    console.log("Approving stylist:", id)
  }

  const handleReject = (id: number) => {
    setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
    // In a real app, this would make an API call to reject the stylist
    console.log("Rejecting stylist:", id)
  }

  const setSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: specialty
    }))
  }

  const handleSaveStylist = async () => {
    setError('')
    setSuccess('')
    setSaving(true)
    
    try {
      // Validate required fields
      if (!formData.business_name.trim()) {
        throw new Error('Business name is required')
      }
      
      if (!formData.location.trim()) {
        throw new Error('Postcode is required')
      }
      
      if (!formData.specialties) {
        throw new Error('Please select a specialty')
      }
      
      if (!formData.bio.trim()) {
        throw new Error('Bio is required')
      }
      
      // Validate postcode format (basic UK postcode validation)
      const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
      if (!postcodeRegex.test(formData.location.trim())) {
        throw new Error('Please enter a valid UK postcode (e.g., SW1A 1AA)')
      }
      
      // Validate email format if provided
      if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
        throw new Error('Please enter a valid email address')
      }
      
      // Validate URL format if provided
      if (formData.booking_link && !formData.booking_link.startsWith('http')) {
        throw new Error('Booking link must start with http:// or https://')
      }
      
      // Create stylist profile data
      const profileData = {
        ...formData,
        specialties: formData.specialties ? [formData.specialties] : [],
        is_active: true, // New profiles are immediately active and visible
        is_verified: true // Admin-created profiles are pre-verified
      }
      
      console.log('Creating stylist profile:', profileData)
      console.log('Gallery images count:', galleryImages.length)
      
      // Use the actual uploaded image URLs
      const portfolioImages = galleryImages
      
      // Log the image upload status
      if (galleryImages.length > 0) {
        console.log('Gallery images to be saved:', galleryImages)
      }
      
      // First create a temporary user_id (in real implementation, this would come from user creation)
      // For now, we'll create the profile without a user_id and admin can link it later
      const { data, error: insertError } = await supabase
        .from('stylist_profiles')
        .insert([
          {
            business_name: profileData.business_name,
            bio: profileData.bio,
            location: profileData.location,
            specialties: profileData.specialties,
            years_experience: profileData.years_experience,
            hourly_rate: profileData.hourly_rate,
            booking_link: profileData.booking_link,
            phone: profileData.phone,
            contact_email: profileData.contact_email,
            instagram_handle: profileData.instagram_handle,
            tiktok_handle: profileData.tiktok_handle,
            is_active: true,
            is_verified: true,
            portfolio_images: portfolioImages,
            rating: 0,
            total_reviews: 0
            // user_id will be null for now - admin can link it when generating login
          }
        ])
        .select()
      
      if (insertError) {
        console.error('Supabase error:', insertError)
        console.error('Error details:', JSON.stringify(insertError, null, 2))
        throw new Error(`Database error: ${insertError.message || insertError.details || 'Unknown database error'}`)
      }
      
      console.log('Stylist profile created successfully:', data)
      
      const stylistId = data[0].id
      console.log('🔍 [ADMIN] About to check mockServices. Length:', mockServices.length)
      console.log('🔍 [ADMIN] mockServices content:', mockServices)
      
      // Save services if any have been added
      let servicesSaveFailed = false
      let servicesFailReason = ''
      
      if (mockServices.length > 0) {
        console.log('Saving services for stylist:', stylistId)
        console.log('Mock services data:', mockServices)
        
        try {
          const response = await fetch('/api/admin/services', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              stylist_id: stylistId,
              services: mockServices
            })
          })

          const result = await response.json()
          
          if (!response.ok) {
            console.error('Error saving services via API:', result)
            
            // Check if it's an RLS policy error
            if (result.details?.code === '42501') {
              console.warn('⚠️ Services could not be saved due to database permissions. This requires a service role key to be configured.')
              // Set a flag to show this in the success message
              servicesSaveFailed = true
              servicesFailReason = 'Database permissions required (service role key needed)'
            }
          } else {
            console.log('Services saved successfully via API:', result.services)
          }
        } catch (apiError) {
          console.error('Error calling services API:', apiError)
          // Continue with profile creation even if services fail
        }
      }
      
      let successMessage = `Stylist profile created successfully! Business: ${formData.business_name}.`
      
      if (galleryImages.length > 0) {
        successMessage += ` ${galleryImages.length} portfolio images have been uploaded and saved.`
      }
      
      if (mockServices.length > 0) {
        if (servicesSaveFailed) {
          successMessage += ` ${mockServices.length} services were configured but could not be saved to database (${servicesFailReason}). Profile created successfully.`
        } else {
          successMessage += ` ${mockServices.length} services have been added to the profile.`
        }
      }
      
      successMessage += ` You can now generate login credentials using the Account Access section.`
      
      setSuccess(successMessage)
      
      // Reset form and clear all images
      setFormData({
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
      
      // Clear all uploaded images and services after successful profile creation
      setGalleryImages([])
      setProfilePhoto('')
      setServiceImageFile(null)
      setServiceImagePreview('')
      setMockServices([]) // Clear services list
      
    } catch (err: any) {
      console.error('Error in handleSaveStylist:', err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      setError(err.message || 'Failed to create stylist profile')
    } finally {
      setSaving(false)
    }
  }
  
  // Service state - similar to stylist dashboard
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: 0,
    duration: 60
  })
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null)
  const [serviceImagePreview, setServiceImagePreview] = useState<string>('')
  const [isServiceDragOver, setIsServiceDragOver] = useState(false)
  const [mockServices, setMockServices] = useState<any[]>([]) // Mock services list for admin

  // Service handlers - similar to stylist dashboard
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

  const handleSaveService = () => {
    console.log('🔍 [ADMIN] handleSaveService called')
    console.log('🔍 [ADMIN] Service form data:', serviceForm)
    
    if (!validateServiceForm()) {
      console.log('❌ [ADMIN] Form validation failed')
      return
    }

    console.log('✅ [ADMIN] Form validation passed')

    const serviceData = {
      id: editingService?.id || Date.now().toString(),
      name: serviceForm.name,
      price: serviceForm.price,
      duration: serviceForm.duration,
      image_url: serviceImagePreview
    }

    console.log('🔍 [ADMIN] Service data to save:', serviceData)

    if (editingService) {
      // Update existing service
      setMockServices(prev => {
        const updated = prev.map(service => 
          service.id === editingService.id ? serviceData : service
        )
        console.log('🔍 [ADMIN] Updated mock services:', updated)
        return updated
      })
      alert(`Service "${serviceForm.name}" updated successfully!`)
    } else {
      // Add new service
      setMockServices(prev => {
        const newServices = [serviceData, ...prev]
        console.log('🔍 [ADMIN] New mock services after adding:', newServices)
        return newServices
      })
      alert(`Service "${serviceForm.name}" added successfully!`)
    }
    
    // Reset form and close modal
    setServiceForm({
      name: '',
      price: 0,
      duration: 60
    })
    setServiceImageFile(null)
    setServiceImagePreview('')
    setIsServiceModalOpen(false)
  }

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setMockServices(prev => prev.filter(service => service.id !== serviceId))
      alert('Service deleted successfully!')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  // Image upload handlers
  const handleGalleryImageUpload = useCallback(async (files: FileList | File[]) => {
    const filesArray = Array.from(files)
    
    try {
      // Check total images limit
      if (galleryImages.length + filesArray.length > 20) {
        alert(`Cannot upload ${filesArray.length} images. Maximum 20 images allowed. You currently have ${galleryImages.length} images.`)
        return
      }
      
      // Set uploading state
      setIsUploading(true)
      
      // Use the admin upload function to upload files to storage
      const uploadedUrls = await adminUploadFiles(filesArray)
      
      // Add the real URLs to gallery images
      setGalleryImages(prevImages => [...prevImages, ...uploadedUrls])
      
      console.log(`📷 [ADMIN] Successfully uploaded ${uploadedUrls.length} images to gallery`)
      
    } catch (err) {
      console.error('Failed to upload images:', err)
      alert(err instanceof Error ? err.message : 'Failed to upload images. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [galleryImages.length, adminUploadFiles]) // Remove galleryImages dependency

  const handleGalleryFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleGalleryImageUpload(files)
      // Reset the file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }, [handleGalleryImageUpload])

  const handleProfilePhotoSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setProfilePhoto(previewUrl)
    }
  }, [])


  const triggerGalleryFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const triggerProfilePhotoSelect = useCallback(() => {
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.click()
    }
  }, [])

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  // Drag and drop handlers for file upload
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
      handleGalleryImageUpload(files)
    }
  }, [handleGalleryImageUpload])

  // Image reordering handlers
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

  const handleImageDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverImageIndex(null)
    
    if (draggedImageIndex === null || draggedImageIndex === dropIndex || !galleryImages.length) {
      setDraggedImageIndex(null)
      return
    }

    try {
      const images = [...galleryImages]
      const draggedImage = images[draggedImageIndex]
      
      // Remove the dragged image from its original position
      images.splice(draggedImageIndex, 1)
      
      // Insert at new position (adjust index if needed)
      const adjustedDropIndex = draggedImageIndex < dropIndex ? dropIndex - 1 : dropIndex
      images.splice(adjustedDropIndex, 0, draggedImage)
      
      setGalleryImages(images)
      console.log(`📷 [ADMIN] Reordered image from position ${draggedImageIndex + 1} to ${adjustedDropIndex + 1}`)
    } catch (err) {
      console.error('❌ [ADMIN] Failed to reorder images:', err)
    } finally {
      setDraggedImageIndex(null)
    }
  }, [draggedImageIndex, galleryImages])

  const handleImageDragEnd = useCallback(() => {
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }, [])

  const handleCancel = () => {
    setFormData({
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
    setError('')
    setSuccess('')
    // Also reset image state
    setGalleryImages([])
    setProfilePhoto('')
    setServiceImageFile(null)
    setServiceImagePreview('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage stylist profiles and verifications</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="create">Create Stylist</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stylists Awaiting Verification</CardTitle>
              <CardDescription>Review and approve or reject stylist applications</CardDescription>
            </CardHeader>
            <CardContent>
              {stylists.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
                  <p className="mt-1 text-sm text-gray-500">All stylist applications have been processed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {stylists.map((stylist) => (
                    <Card key={stylist.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-4 w-full lg:w-auto space-y-4 lg:space-y-0">
                            {/* Large gallery image - full width on mobile, fixed width on desktop */}
                            <div className="w-full lg:w-64 h-48 lg:h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src="/placeholder.svg"
                                alt={`${stylist.name}'s work`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Stylist information */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src="/placeholder.svg"
                                    alt={`${stylist.businessName}'s profile`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{stylist.businessName}</h3>
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {stylist.location}
                                </div>
                                <div className="mt-2">
                                  <span className="text-sm text-gray-600">Experience: {stylist.experience}</span>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {stylist.specialties.map((specialty) => (
                                  <Badge key={specialty} variant="secondary">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                              <div className="mt-3">
                                <p className="text-sm text-gray-700">{stylist.bio}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex space-x-2 w-full lg:w-auto lg:justify-end">
                            <Button
                              onClick={() => handleApprove(stylist.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(stylist.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Profile Information Card */}
          <Card className="mb-5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-red-600" />
                  Profile Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 1. LOGO SECTION */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Logo</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`/placeholder.svg?height=100&width=100&text=${encodeURIComponent(formData.business_name || 'Business')}`} />
                    <AvatarFallback>{(formData.business_name || 'Business').split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-sm mb-2"
                      onClick={triggerProfilePhotoSelect}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <input
                      ref={profilePhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleProfilePhotoSelect}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* 2. TWO COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
                  <div className="space-y-5">
                    {/* Business Name */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Business Name</label>
                      <Input
                        value={formData.business_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                        placeholder="Your business name"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Postcode</label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value.toUpperCase() }))}
                        placeholder="SW1A 1AA"
                        maxLength={8}
                        pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
                        title="Please enter a valid UK postcode (e.g., SW1A 1AA)"
                      />
                    </div>

                    {/* Specialties */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Specialty</label>
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
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Bio</label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell clients about yourself and your services..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    {/* Experience and Rate */}
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
                  </div>
                </div>

                {/* Right Column - Contact Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Details</h3>
                  <div className="space-y-5">
                    {/* Booking Link */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Booking Link</label>
                      <Input
                        value={formData.booking_link}
                        onChange={(e) => setFormData(prev => ({ ...prev, booking_link: e.target.value }))}
                        placeholder="https://your-booking-site.com"
                        type="url"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Your phone number"
                        type="tel"
                      />
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Contact Email</label>
                      <Input
                        value={formData.contact_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                        placeholder="contact@yourbusiness.com"
                        type="email"
                      />
                    </div>

                    {/* Instagram Handle */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Instagram</label>
                      <Input
                        value={formData.instagram_handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                        placeholder="@yourusername"
                      />
                    </div>

                    {/* TikTok Handle */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">TikTok</label>
                      <Input
                        value={formData.tiktok_handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, tiktok_handle: e.target.value }))}
                        placeholder="@yourusername"
                      />
                    </div>
                  </div>
                </div>
              </div>

          </CardContent>
        </Card>

          {/* Gallery Settings Card */}
          <Card className="mb-5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-red-600" />
                  Gallery Settings
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Gallery */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    Current Gallery ({galleryImages.length}/20)
                  </h4>
                  <p className="text-xs text-gray-500">Drag images to reorder</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {galleryImages.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No images uploaded yet</p>
                      <p className="text-xs">Start building your portfolio by uploading images below</p>
                    </div>
                  ) : (
                    galleryImages.map((imageUrl, index) => (
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
                        onDrop={(e) => handleImageDrop(e, index)}
                        onDragEnd={handleImageDragEnd}
                      >
                        <img 
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover bg-gray-200 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                        
                        {/* Position indicator */}
                        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {index + 1}
                        </div>
                        
                        {/* Delete button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveGalleryImage(index)
                          }}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add New Images */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Add New Images</h4>
                
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
                    {isDragOver ? 'Drop images here' : 'Select Gallery Images'}
                  </h5>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop images here, or click the button below to select files
                  </p>
                  
                  <Button 
                    variant="outline"
                    onClick={triggerGalleryFileSelect}
                    disabled={isUploading}
                    className="text-red-600 border-red-600 hover:bg-red-50"
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
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    multiple
                    onChange={handleGalleryFileSelect}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-gray-400 mt-3">
                    <span className="font-medium text-gray-600">Tip:</span> Hold Ctrl (Windows) or Cmd (Mac) to select multiple files at once.<br/>
                    JPG, PNG or GIF. Max 5MB each. Up to 20 images total.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services & Pricing Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Scissors className="w-5 h-5 mr-2 text-red-600" />
                    Services & Pricing
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Note: Service saving requires SUPABASE_SERVICE_ROLE_KEY in .env.local
                  </p>
                </div>
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
            <CardContent>
              {mockServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockServices.map((service) => (
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
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteService(service.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-500">
                            <span className="text-sm">{formatDuration(service.duration)}</span>
                          </div>
                          
                          <div className="mt-2">
                            <span className="text-lg font-semibold text-gray-900">£{service.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Scissors className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No services added yet</p>
                  <p className="text-xs">Add services for this stylist using the button above</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Access Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-red-600" />
                Account Access
              </CardTitle>
              <CardDescription>
                Create stylist profile and generate login credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Stylist Profile Status</h4>
                    <p className="text-sm text-gray-500 mt-1">Complete the form above to create a new stylist profile</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Ready to Create
                  </Badge>
                </div>
                
                {/* Create Profile Button */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveStylist}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Profile...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Create Stylist Profile</>
                    )}
                  </Button>
                </div>
                
                {/* Generate Login - Placeholder */}
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    disabled={true}
                    className="bg-gray-100 text-gray-400 cursor-not-allowed w-full"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Generate Login Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Create the stylist profile first, then generate login credentials
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard
