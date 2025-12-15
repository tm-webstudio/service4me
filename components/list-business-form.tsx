"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, Map, Building, User, Lock, Eye, EyeOff, CheckCircle, Home, Upload, Image as ImageIcon, X, Lightbulb, Check, ArrowRight, Briefcase, Camera, Plus, Save, ClipboardList, GripVertical } from "lucide-react"
import { useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const SPECIALTY_CATEGORIES = [
  "Wigs",
  "Braids",
  "Locs",
  "Natural Hair",
  "Bridal Hair",
  "Silk Press"
]

const ADDITIONAL_SERVICES = [
  "Wigs",
  "Braids",
  "Locs",
  "Natural Hair",
  "Bridal Hair",
  "Silk Press",
  "Sew-Ins",
  "Butterfly Locs",
  "Ponytails"
]

export function ListBusinessForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { signUp } = useAuth()
  const router = useRouter()

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<Array<{url: string, file?: File, isPrimary: boolean}>>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  // Logo state
  const [logoImage, setLogoImage] = useState<{url: string, file?: File} | null>(null)
  const [isLogoDragOver, setIsLogoDragOver] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    businessInstagram: "",
    businessTiktok: "",

    // Step 2: Business Details
    location: "",
    businessType: "",
    specialty: "",
    bio: "",
    experience: "",
    bookingLink: "",
    acceptsSameDayAppointments: null as boolean | null,
    acceptsMobileAppointments: null as boolean | null,

    // Step 3: Photos
    // photos handled by galleryImages state

    // Step 4: Account Setup
    password: "",
    confirmPassword: "",
  })

  // Additional services state
  const [additionalServices, setAdditionalServices] = useState<string[]>([])

  // Services state
  const [services, setServices] = useState<Array<{id: string, name: string, price: number, duration: number, image_url?: string}>>([])
  const [serviceForm, setServiceForm] = useState({ name: "", price: 0, duration: 60 })
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null)
  const [serviceImagePreview, setServiceImagePreview] = useState<string>('')
  const [isServiceDragOver, setIsServiceDragOver] = useState(false)
  const serviceImageInputRef = useRef<HTMLInputElement>(null)

  const totalSteps = 4
  const progressPercentage = (currentStep / totalSteps) * 100

  // Reset scroll position on step change so each step starts at the top
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentStep])

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.businessName || !formData.email || !formData.phone) {
        setError("Please fill in all required fields")
        return
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Please enter a valid email address")
        return
      }
    } else if (currentStep === 2) {
      if (!formData.businessType || !formData.location || !formData.bio || !formData.specialty) {
        setError("Please fill in all required fields")
        return
      }
    }

    setError("")
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const handleBack = () => {
    setError("")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Service handlers
  const openAddServiceModal = () => {
    setEditingServiceId(null)
    setServiceForm({ name: "", price: 0, duration: 60 })
    setServiceImageFile(null)
    setServiceImagePreview('')
    setIsServiceDragOver(false)
    setIsServiceModalOpen(true)
  }

  const openEditServiceModal = (service: {id: string, name: string, price: number, duration: number, image_url?: string}) => {
    setEditingServiceId(service.id)
    setServiceForm({ name: service.name, price: service.price, duration: service.duration })
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

  const handleAddService = () => {
    if (!serviceForm.name.trim() || serviceForm.price <= 0 || serviceForm.duration <= 0) {
      setError("Please fill in all service details correctly")
      return
    }

    if (editingServiceId) {
      // Update existing service
      setServices(prev => prev.map(service =>
        service.id === editingServiceId
          ? { ...service, name: serviceForm.name, price: serviceForm.price, duration: serviceForm.duration, image_url: serviceImagePreview }
          : service
      ))
    } else {
      // Add new service
      const newService = {
        id: Date.now().toString(),
        name: serviceForm.name,
        price: serviceForm.price,
        duration: serviceForm.duration,
        image_url: serviceImagePreview
      }
      setServices(prev => [...prev, newService])
    }

    setServiceForm({ name: "", price: 0, duration: 60 })
    setServiceImageFile(null)
    setServiceImagePreview('')
    setEditingServiceId(null)
    setIsServiceModalOpen(false)
    setError("")
  }

  const handleRemoveService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id))
  }

  // Additional services handler
  const toggleAdditionalService = (service: string) => {
    setAdditionalServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  // Logo handlers
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoImage({
      url: URL.createObjectURL(file),
      file
    })
  }

  const handleLogoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsLogoDragOver(false)

    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return

    setLogoImage({
      url: URL.createObjectURL(file),
      file
    })
  }, [])

  const handleLogoDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsLogoDragOver(true)
  }, [])

  const handleLogoDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsLogoDragOver(false)
  }, [])

  const handleRemoveLogo = () => {
    setLogoImage(null)
  }

  // Gallery handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages = Array.from(files).map((file, index) => ({
      url: URL.createObjectURL(file),
      file,
      isPrimary: galleryImages.length === 0 && index === 0
    }))

    setGalleryImages(prev => [...prev, ...newImages].slice(0, 10))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (!files) return

    const newImages = Array.from(files).map((file, index) => ({
      url: URL.createObjectURL(file),
      file,
      isPrimary: galleryImages.length === 0 && index === 0
    }))

    setGalleryImages(prev => [...prev, ...newImages].slice(0, 10))
  }, [galleryImages.length])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleRemoveImage = (index: number) => {
    setGalleryImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      // If we removed the primary image, make the first image primary
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true
      }
      return newImages
    })
  }

  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleImageDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleImageDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    // Ensure final order is applied when dropping
    if (draggedIndex !== index) {
      const newImages = [...galleryImages]
      const [draggedImage] = newImages.splice(draggedIndex, 1)
      newImages.splice(index, 0, draggedImage)
      setGalleryImages(newImages)
    }

    setDraggedIndex(null)
  }

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = useCallback((index: number) => {
    setTouchDragIndex(index)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchDragIndex === null || !galleryRef.current) return

    // Prevent scrolling while dragging
    e.preventDefault()

    const touch = e.touches[0]
    const galleryItems = galleryRef.current.querySelectorAll('[data-gallery-item]')

    galleryItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect()
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom &&
        index !== touchDragIndex
      ) {
        // Swap images when dragging over a different item
        const newImages = [...galleryImages]
        const [draggedImage] = newImages.splice(touchDragIndex, 1)
        newImages.splice(index, 0, draggedImage)
        setGalleryImages(newImages)
        setTouchDragIndex(index)
      }
    })
  }, [touchDragIndex, galleryImages])

  const handleTouchEnd = useCallback(() => {
    setTouchDragIndex(null)
  }, [])

  // Helper function to upload image to Supabase Storage
  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const fullPath = `${path}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('stylist-images')
        .upload(fullPath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('stylist-images')
        .getPublicUrl(fullPath)

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      // Generate a temporary ID for the profile folder
      const tempId = `temp-${Date.now()}`

      // Step 1: Upload portfolio images
      const uploadedPortfolioUrls: string[] = []
      for (const image of galleryImages) {
        if (image.file) {
          const url = await uploadImage(image.file, `portfolio/${tempId}`)
          if (url) uploadedPortfolioUrls.push(url)
        } else if (image.url && !image.url.startsWith('blob:')) {
          uploadedPortfolioUrls.push(image.url)
        }
      }

      // Step 2: Upload logo if exists
      let uploadedLogoUrl: string | null = null
      if (logoImage?.file) {
        uploadedLogoUrl = await uploadImage(logoImage.file, `logos/${tempId}`)
      }

      // Step 3: Create stylist profile FIRST (without user_id)
      // The trigger will link it when the user is created
      const { data: profileData, error: profileError } = await supabase
        .from('stylist_profiles')
        .insert({
          // Basic info
          business_name: formData.businessName,
          contact_email: formData.email,
          phone: formData.phone,
          instagram_handle: formData.businessInstagram || null,
          tiktok_handle: formData.businessTiktok || null,

          // Business details
          location: formData.location,
          business_type: formData.businessType || null,
          primary_specialty: formData.specialty,
          specialties: formData.specialty ? [formData.specialty] : [],
          additional_services: additionalServices,
          bio: formData.bio,
          year_started: formData.experience ? parseInt(formData.experience) : null,
          booking_link: formData.bookingLink || null,
          accepts_same_day: formData.acceptsSameDayAppointments ?? false,
          accepts_mobile: formData.acceptsMobileAppointments ?? false,

          // Images
          portfolio_images: uploadedPortfolioUrls,
          logo_url: uploadedLogoUrl,

          // Status
          verification_status: 'pending_verification',
          submitted_at: new Date().toISOString(),
          is_active: false, // Not active until approved
          is_verified: false,

          // Defaults
          rating: 0,
          total_reviews: 0,
          average_rating: 0,
          review_count: 0
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('Failed to create business profile. Please try again.')
      }

      // Step 4: Create auth user - the trigger will link the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'stylist',
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
            profile_id: profileData.id
          }
        }
      })

      if (authError) {
        // If auth fails, delete the profile we just created
        await supabase.from('stylist_profiles').delete().eq('id', profileData.id)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        await supabase.from('stylist_profiles').delete().eq('id', profileData.id)
        throw new Error('Failed to create user account')
      }

      // Step 5: Create users table entry (this triggers the profile linking)
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          role: 'stylist',
          phone: formData.phone
        })

      if (userError && userError.code !== '23505') { // Ignore duplicate key errors
        console.error('User creation error:', userError)
      }

      // Step 6: Create services if any
      if (services.length > 0 && profileData.id) {
        for (const service of services) {
          // Upload service image if exists
          let serviceImageUrl: string | null = null
          if (service.image_url && service.image_url.startsWith('blob:')) {
            // Find the corresponding file from serviceImageFile state (need to handle this)
          } else {
            serviceImageUrl = service.image_url || null
          }

          await supabase.from('services').insert({
            stylist_id: profileData.id,
            name: service.name,
            price: service.price,
            duration: service.duration,
            image_url: serviceImageUrl
          })
        }
      }

      // Step 7: Redirect to success page
      router.push("/list-business/success")

    } catch (err: any) {
      console.error('Submission error:', err)
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 py-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm px-3 py-4 sm:p-6 mb-4">
          <div className="mb-2">
            <p className="text-xs sm:text-sm font-medium text-red-600 uppercase tracking-wide">Join Our Platform</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">List Your Business</h1>
          <p className="text-sm sm:text-base text-gray-900">Connect with clients looking for your services</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-4">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-gray-900">Step {currentStep} of {totalSteps}</p>
              <p className="text-sm font-medium text-gray-900">{Math.round(progressPercentage)}% Complete</p>
            </div>

            {/* Progress bar with integrated nodes */}
            <div className="relative">
              {/* Background line - extends beyond first and last icons */}
              <div
                className="absolute top-3 sm:top-[11px] left-0 right-0 h-2 sm:h-2.5 bg-gray-200 rounded-full"
                style={{ zIndex: 0 }}
              />

              {/* Filled progress line - starts from left edge */}
              <div
                className="absolute top-3 sm:top-[11px] left-0 h-2 sm:h-2.5 bg-red-600 transition-all duration-300 rounded-full"
                style={{
                  width: currentStep === 1
                    ? '12.5%'
                    : currentStep === 2
                    ? '37.5%'
                    : currentStep === 3
                    ? '62.5%'
                    : '100%',
                  zIndex: 1
                }}
              />

              {/* Step nodes */}
              <div className="relative flex items-start justify-between gap-2 sm:gap-4" style={{ zIndex: 2 }}>
                {/* Step 1: Basic Info */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 1
                      ? 'bg-red-600'
                      : 'bg-white border-2 border-gray-200'
                    }
                  `}>
                    <User className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentStep >= 1 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-normal text-center leading-tight ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                    <span className="hidden sm:inline">Basic Info</span>
                    <span className="sm:hidden">Info</span>
                  </p>
                </div>

                {/* Step 2: Business Details */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 2
                      ? 'bg-red-600'
                      : 'bg-white border-2 border-gray-200'
                    }
                  `}>
                    <Briefcase className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentStep >= 2 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-normal text-center leading-tight ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                    <span className="hidden sm:inline">Business Details</span>
                    <span className="sm:hidden">Business</span>
                  </p>
                </div>

                {/* Step 3: Photos */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 3
                      ? 'bg-red-600'
                      : 'bg-white border-2 border-gray-200'
                    }
                  `}>
                    <Camera className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentStep >= 3 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-normal text-center leading-tight ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                    Photos
                  </p>
                </div>

                {/* Step 4: Account Setup */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 4
                      ? 'bg-red-600'
                      : 'bg-white border-2 border-gray-200'
                    }
                  `}>
                    <Lock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentStep >= 4 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-normal text-center leading-tight ${currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>
                    <span className="hidden sm:inline">Account Setup</span>
                    <span className="sm:hidden">Account</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card>
          <CardContent className="px-3 py-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Home className="w-4 h-4 mr-2 text-red-600" />
                    <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-900 mb-2 block">
                        First Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-900 mb-2 block">
                        Last Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Smith"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessName" className="text-sm font-medium text-gray-900 mb-2 block">
                        Business Name <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="businessName"
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="e.g., Glamour Hair Studio"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
                        Email Address <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-900 mb-2 block">
                        Phone Number <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="07123 456789"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessInstagram" className="text-sm font-medium text-gray-900 mb-2 block">
                        Business Instagram
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                        <Input
                          id="businessInstagram"
                          type="text"
                          value={formData.businessInstagram}
                          onChange={(e) => setFormData({ ...formData, businessInstagram: e.target.value })}
                          placeholder="yourbusiness"
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessTiktok" className="text-sm font-medium text-gray-900 mb-2 block">
                        Business TikTok
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                        <Input
                          id="businessTiktok"
                          type="text"
                          value={formData.businessTiktok}
                          onChange={(e) => setFormData({ ...formData, businessTiktok: e.target.value })}
                          placeholder="yourbusiness"
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Message for Step 1 */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Briefcase className="w-4 h-4 mr-2 text-red-600" />
                    <h2 className="text-base font-semibold text-gray-900">Business Details</h2>
                  </div>

                  {/* Specialty & Location Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="specialty" className="text-sm font-medium text-gray-900 mb-2 block">
                        Specialty <span className="text-red-600">*</span>
                      </Label>
                      <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTY_CATEGORIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="businessType" className="text-sm font-medium text-gray-900 mb-2 block">
                        Location Type <span className="text-red-600">*</span>
                      </Label>
                      <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home-based">Home Based</SelectItem>
                          <SelectItem value="studio-based">Studio Based</SelectItem>
                          <SelectItem value="salon-based">Salon Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Services */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-1 block">
                      Additional Services
                    </Label>
                    <p className="text-xs text-gray-400 mb-4">Select other services you provide apart from your specialty</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      {ADDITIONAL_SERVICES.filter(category => category !== formData.specialty).map((service) => (
                        <div
                          key={service}
                          onClick={() => toggleAdditionalService(service)}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={additionalServices.includes(service)}
                            onChange={() => {}}
                            className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                          />
                          <span className="ml-2 text-[12.5px] text-gray-600">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="bookingLink" className="text-sm font-medium text-gray-900 mb-2 block">
                        Booking Link
                      </Label>
                      <Input
                        id="bookingLink"
                        type="url"
                        value={formData.bookingLink}
                        onChange={(e) => setFormData({ ...formData, bookingLink: e.target.value })}
                        placeholder="https://your-booking-site.com"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400 mt-1">Add your booking page URL (e.g., Calendly, Square, etc.)</p>
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-900 mb-2 block">
                        Postcode <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="location"
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value.toUpperCase() })}
                          placeholder="SW1A 1AA"
                          className="pl-10"
                          maxLength={8}
                          pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
                          title="Please enter a valid UK postcode (e.g., SW1A 1AA)"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Enter a valid UK postcode</p>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="experience" className="text-sm font-medium text-gray-900 mb-2 block">
                          Year Started
                        </Label>
                        <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year started" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">
                          Accept Same-Day Appointments?
                        </Label>
                        <div className="flex items-center gap-6 h-10">
                          <div
                            onClick={() => setFormData({ ...formData, acceptsSameDayAppointments: true })}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.acceptsSameDayAppointments === true}
                              onChange={() => {}}
                              className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                            />
                            <span className="ml-2 text-[12.5px] text-gray-600">Yes</span>
                          </div>

                          <div
                            onClick={() => setFormData({ ...formData, acceptsSameDayAppointments: false })}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.acceptsSameDayAppointments === false}
                              onChange={() => {}}
                              className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                            />
                            <span className="ml-2 text-[12.5px] text-gray-600">No</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">
                          Offer Mobile Appointments?
                        </Label>
                        <div className="flex items-center gap-6 h-10">
                          <div
                            onClick={() => setFormData({ ...formData, acceptsMobileAppointments: true })}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.acceptsMobileAppointments === true}
                              onChange={() => {}}
                              className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                            />
                            <span className="ml-2 text-[12.5px] text-gray-600">Yes</span>
                          </div>

                          <div
                            onClick={() => setFormData({ ...formData, acceptsMobileAppointments: false })}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.acceptsMobileAppointments === false}
                              onChange={() => {}}
                              className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                            />
                            <span className="ml-2 text-[12.5px] text-gray-600">No</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-900 mb-2 block">
                      Profile Bio <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell clients about yourself and your services..."
                      className="min-h-[120px] resize-none"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Share your story, expertise, and what makes you stand out</p>
                  </div>

                  {/* Services */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-900">Services</Label>
                      <Dialog open={isServiceModalOpen} onOpenChange={(open) => {
                        setIsServiceModalOpen(open)
                        if (!open) {
                          setIsServiceDragOver(false)
                        }
                      }}>
                        <DialogTrigger asChild>
                          <SmallCtaButton
                            type="button"
                            onClick={openAddServiceModal}
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Service
                          </SmallCtaButton>
                        </DialogTrigger>
                        <DialogContent className="w-[92vw] max-w-md sm:w-full">
                          <DialogHeader>
                            <DialogTitle>{editingServiceId ? 'Edit Service' : 'Add New Service'}</DialogTitle>
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
                                  accept="image/jpeg,image/jpg,image/png,image/gif,image/heic,image/heif"
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
                                  value={serviceForm.price || ''}
                                  onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                  placeholder="100"
                                />
                              </div>
                              <div>
                                <Label htmlFor="service-duration">Duration</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Select
                                      value={Math.floor(serviceForm.duration / 60).toString()}
                                      onValueChange={(value) => setServiceForm(prev => ({
                                        ...prev,
                                        duration: (parseInt(value) * 60) + (prev.duration % 60)
                                      }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Hours" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0">0 hrs</SelectItem>
                                        <SelectItem value="1">1 hr</SelectItem>
                                        <SelectItem value="2">2 hrs</SelectItem>
                                        <SelectItem value="3">3 hrs</SelectItem>
                                        <SelectItem value="4">4 hrs</SelectItem>
                                        <SelectItem value="5">5 hrs</SelectItem>
                                        <SelectItem value="6">6 hrs</SelectItem>
                                        <SelectItem value="7">7 hrs</SelectItem>
                                        <SelectItem value="8">8 hrs</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Select
                                      value={(serviceForm.duration % 60).toString()}
                                      onValueChange={(value) => setServiceForm(prev => ({
                                        ...prev,
                                        duration: (Math.floor(prev.duration / 60) * 60) + parseInt(value)
                                      }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Minutes" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0">0 min</SelectItem>
                                        <SelectItem value="15">15 min</SelectItem>
                                        <SelectItem value="30">30 min</SelectItem>
                                        <SelectItem value="45">45 min</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-2 pt-4">
                              <Button
                                type="button"
                                onClick={handleAddService}
                                className="bg-red-600 hover:bg-red-700 flex-1"
                                disabled={!serviceForm.name || serviceForm.price <= 0 || serviceForm.duration <= 0}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {editingServiceId ? 'Update Service' : 'Add Service'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsServiceModalOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Services List */}
                    {services.length > 0 && (
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div key={service.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              {service.image_url && (
                                <img
                                  src={service.image_url}
                                  alt={service.name}
                                  className="w-16 h-16 object-cover rounded-lg border flex-shrink-0 cursor-pointer"
                                  onClick={() => openEditServiceModal(service)}
                                />
                              )}
                              <div className="flex-1 cursor-pointer" onClick={() => openEditServiceModal(service)}>
                                <h4 className="font-semibold text-gray-900 text-sm">{service.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-600">{service.duration} min</span>
                                  <span className="text-sm font-semibold text-gray-900">£{service.price}</span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveService(service.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {services.length === 0 && (
                      <div className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg flex flex-col items-center gap-1">
                        <ClipboardList className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-sm font-semibold text-gray-800">Add Your Services</p>
                        <p>Click "Add Service" to get started.</p>
                      </div>
                    )}
                  </div>

                  {/* Error Message for Step 2 */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Photos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Camera className="w-4 h-4 mr-2 text-red-600" />
                    <h2 className="text-base font-semibold text-gray-900">Photos</h2>
                  </div>

                  {/* Logo Upload */}
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Business Logo</h3>
                    <p className="text-sm text-gray-500 mb-4">Upload your business logo (optional)</p>

                    <div
                      onDrop={handleLogoDrop}
                      onDragOver={handleLogoDragOver}
                      onDragLeave={handleLogoDragLeave}
                      className={`flex items-start gap-4 sm:gap-6 p-4 sm:p-5 rounded-lg border bg-white transition-colors cursor-pointer ${
                        isLogoDragOver ? "border-red-500 bg-red-50" : "border-gray-200"
                      }`}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoImage ? (
                          <img
                            src={logoImage.url}
                            alt="Business logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {logoImage ? "Logo uploaded" : "Add Business Logo"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Drag a file here or use upload. PNG, JPG, GIF, HEIC. Max 5MB.
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              logoInputRef.current?.click()
                            }}
                            className="h-7 px-2 text-[10px] font-medium text-gray-600 bg-gray-50/90 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
                          >
                            <Upload className="w-3 h-3 mr-1.5 text-gray-600" />
                            {logoImage ? "Replace logo" : "Upload logo"}
                          </Button>
                          {logoImage && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveLogo()
                              }}
                              className="h-7 w-7 p-0 bg-red-600 hover:bg-red-700 text-white"
                              aria-label="Remove logo"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/heic,image/heif"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Photo Count */}
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Portfolio Photos ({galleryImages.length}/10)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="hidden sm:inline">Drag to reorder</span>
                      <span className="sm:hidden">Hold and drag to reorder</span>
                    </p>
                  </div>

                  {/* Image Gallery */}
                  {galleryImages.length > 0 && (
                    <div
                      ref={galleryRef}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"
                    >
                      {galleryImages.map((image, index) => (
                        <div
                          key={index}
                          data-gallery-item
                          draggable
                          onDragStart={(e) => handleImageDragStart(e, index)}
                          onDragOver={(e) => handleImageDragOver(e, index)}
                          onDrop={(e) => handleImageDrop(e, index)}
                          onDragEnd={handleImageDragEnd}
                          onTouchStart={() => handleTouchStart(index)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          className={`relative group cursor-move rounded-lg overflow-hidden aspect-[4/3] border-2 transition-all duration-150 ${
                            draggedIndex === index || touchDragIndex === index
                              ? 'border-red-500 scale-[1.03] shadow-lg z-20 opacity-95'
                              : draggedIndex !== null || touchDragIndex !== null
                                ? 'border-gray-300 opacity-70'
                                : 'border-gray-200 hover:border-red-400'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />

                          {/* Photo Label */}
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                            Photo {index + 1}
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              type="button"
                              draggable
                              onDragStart={(e) => handleImageDragStart(e, index)}
                              onDragOver={(e) => handleImageDragOver(e, index)}
                              onDrop={(e) => handleImageDrop(e, index)}
                              onDragEnd={handleImageDragEnd}
                              className="bg-black/60 text-white p-1.5 rounded-sm hover:bg-black/80 transition-colors cursor-grab active:cursor-grabbing"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="bg-red-600 text-white p-1.5 rounded-sm hover:bg-red-700 transition-colors"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center transition-colors
                      ${isDragOver ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white'}
                      ${galleryImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={galleryImages.length >= 10}
                    />

                    <div className="flex flex-col items-center text-center">
                      <Upload className="w-5 h-5 text-gray-400 mb-2" />
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">
                        Upload Portfolio Photos
                      </h3>
                      <p className="text-xs text-gray-500 mb-3 space-y-1 leading-relaxed">
                        <span className="block">Drop photos here or tap to add (10 max, 10MB each).</span>
                        <span className="block">JPEG, PNG, WebP.</span>
                      </p>
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={galleryImages.length >= 10}
                        size="sm"
                        className="h-8 px-3 text-[12px] font-semibold bg-green-600 hover:bg-green-700"
                      >
                        Choose Photos
                      </Button>
                    </div>
                  </div>

                  {/* Error Message for Step 3 */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Account Setup */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Business Summary - At Top */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>

                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* Primary Image */}
                      {galleryImages.length > 0 && (
                        <div className="w-full md:w-48 md:flex-shrink-0">
                          <div className="relative w-full aspect-[4/3]">
                            <img
                              src={galleryImages.find(img => img.isPrimary)?.url || galleryImages[0].url}
                              alt="Business preview"
                              className="absolute inset-0 w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        </div>
                      )}

                      {/* Business Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{formData.businessName}</h4>
                          {formData.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <Map className="w-3.5 h-3.5" />
                              <span>{formData.location}</span>
                            </div>
                          )}
                        </div>

                        {formData.specialty && (
                          <div>
                            <span className="inline-block bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                              {formData.specialty} Specialist
                            </span>
                          </div>
                        )}

                        {formData.bio && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-900 mb-1">Description:</p>
                            <p className="text-sm text-gray-600">{formData.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Create Account Section - At Bottom */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <Lock className="w-4 h-4 mr-2 text-red-600" />
                      <h3 className="text-base font-semibold text-gray-900">Create Your Account to Publish</h3>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-500">Signing up as</span>
                      <span className="text-sm font-medium text-gray-900">{formData.email}</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password" className="text-sm font-medium text-gray-900 mb-2 block">
                            Password <span className="text-red-600">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Create a password"
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900 mb-2 block">
                            Confirm Password <span className="text-red-600">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="Confirm your password"
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Message for Step 4 */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="text-sm font-normal px-4 py-2"
            >
              Back
            </Button>
          )}

          <div className={currentStep === 1 ? "ml-auto" : ""}>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-red-600 hover:bg-red-700 text-sm font-normal px-4 py-2"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                className="bg-red-600 hover:bg-red-700 text-sm font-normal px-4 py-2"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
