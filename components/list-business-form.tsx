"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, Map, Building, User, Lock, Eye, EyeOff, CheckCircle, Home, Upload, Star, Image as ImageIcon, X, Lightbulb, Check, ArrowRight } from "lucide-react"
import { useRef, useCallback } from "react"

const SPECIALTY_CATEGORIES = [
  "Wigs & Weaves",
  "Braids",
  "Locs",
  "Natural Hair",
  "Bridal Hair",
  "Silk Press"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",

    // Step 2: Location & Details
    location: "",
    bio: "",
    experience: "",
    specialties: [] as string[],

    // Step 3: Photos
    // photos handled by galleryImages state

    // Step 4: Account Setup
    password: "",
    confirmPassword: "",
  })

  const totalSteps = 4
  const progressPercentage = (currentStep / totalSteps) * 100

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
      if (!formData.location || !formData.bio || formData.specialties.length === 0) {
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

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
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

  const handleSetPrimary = (index: number) => {
    setGalleryImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })))
  }

  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...galleryImages]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    setGalleryImages(newImages)
    setDraggedIndex(index)
  }

  const handleImageDragEnd = () => {
    setDraggedIndex(null)
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
      const result = await signUp(
        formData.email,
        formData.password,
        "stylist",
        {
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          businessName: formData.businessName,
          location: formData.location,
          bio: formData.bio,
          experience: formData.experience,
          specialties: formData.specialties
        }
      )

      console.log("Stylist signup result:", result)

      if (result.user) {
        router.push("/dashboard/stylist")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 py-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4">
          <div className="mb-2">
            <p className="text-xs sm:text-sm font-medium text-red-600 uppercase tracking-wide">Join Our Platform</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">List Your Business</h1>
          <p className="text-sm sm:text-base text-gray-700">Connect with clients looking for your services</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-4">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</p>
              <p className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}% Complete</p>
            </div>

            {/* Progress bar with integrated nodes */}
            <div className="relative px-2 sm:px-6 md:px-8">
              {/* Background line */}
              <div className="absolute top-[14px] sm:top-4 left-0 right-0 h-2 sm:h-2.5 bg-gray-200 rounded-full" style={{ zIndex: 0 }} />

              {/* Filled progress line */}
              <div
                className="absolute top-[14px] sm:top-4 h-2 sm:h-2.5 bg-red-600 transition-all duration-300 rounded-full"
                style={{
                  left: 0,
                  width: currentStep === 1
                    ? '40px'
                    : currentStep === 2
                    ? 'calc(33.33% + 20px)'
                    : currentStep === 3
                    ? 'calc(66.66% - 28px)'
                    : 'calc(100%)',
                  zIndex: 1
                }}
              />

              {/* Step nodes */}
              <div className="relative flex items-start justify-between gap-2 sm:gap-4" style={{ zIndex: 2 }}>
                {/* Step 1: Basic Info */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 1
                      ? 'bg-red-600 border-red-600'
                      : 'bg-white border-gray-200'
                    }
                  `}>
                    <User className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentStep >= 1 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-normal text-center leading-tight ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                    <span className="hidden sm:inline">Basic Info</span>
                    <span className="sm:hidden">Basic<br/>Info</span>
                  </p>
                </div>

                {/* Step 2: Location & Details */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 2
                      ? 'bg-red-600 border-red-600'
                      : 'bg-white border-gray-200'
                    }
                  `}>
                    <Map className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentStep >= 2 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-normal text-center leading-tight ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                    <span className="hidden sm:inline">Location & Details</span>
                    <span className="sm:hidden">Location</span>
                  </p>
                </div>

                {/* Step 3: Photos */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 3
                      ? 'bg-red-600 border-red-600'
                      : 'bg-white border-gray-200'
                    }
                  `}>
                    <ImageIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentStep >= 3 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-normal text-center leading-tight ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                    Photos
                  </p>
                </div>

                {/* Step 4: Account Setup */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all
                    ${currentStep >= 4
                      ? 'bg-red-600 border-red-600'
                      : 'bg-white border-gray-200'
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
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Home className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                        First Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Enter first name"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                        Last Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter last name"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 mb-2 block">
                      Business Name <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Enter business name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Map className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Location & Details</h2>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
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
                    <p className="text-xs text-gray-500 mt-1">Enter a valid UK postcode</p>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-2 block">
                      Business Description <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Describe your business and services..."
                      className="min-h-[120px] resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Tell clients about your business and what makes you unique</p>
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">
                      Years of Experience
                    </Label>
                    <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">0-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Specialties <span className="text-red-600">*</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SPECIALTY_CATEGORIES.map((specialty) => (
                        <div
                          key={specialty}
                          onClick={() => handleSpecialtyToggle(specialty)}
                          className={`
                            border rounded-lg p-3 cursor-pointer transition-all
                            ${formData.specialties.includes(specialty)
                              ? 'border-red-600 bg-red-50 text-red-900'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-center">
                            <div className={`
                              w-4 h-4 rounded border mr-2 flex items-center justify-center
                              ${formData.specialties.includes(specialty)
                                ? 'border-red-600 bg-red-600'
                                : 'border-gray-300'
                              }
                            `}>
                              {formData.specialties.includes(specialty) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{specialty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {formData.specialties.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">Select at least one specialty</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Photos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <ImageIcon className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
                  </div>

                  {/* Photo Count */}
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Portfolio Photos ({galleryImages.length}/10)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag to reorder • Click star to set as primary
                    </p>
                  </div>

                  {/* Image Gallery */}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {galleryImages.map((image, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => handleImageDragStart(e, index)}
                          onDragOver={(e) => handleImageDragOver(e, index)}
                          onDragEnd={handleImageDragEnd}
                          className="relative group cursor-move rounded-lg overflow-hidden aspect-[4/3] border-2 border-gray-200 hover:border-red-400 transition-all"
                        >
                          <img
                            src={image.url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Primary Badge */}
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded flex items-center gap-1 text-xs font-medium">
                              <Star className="w-3 h-3 fill-white" />
                              Primary
                            </div>
                          )}

                          {/* Photo Label */}
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                            Photo {index + 1}
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(index)}
                              className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                              title="Set as primary"
                            >
                              <Star className={`w-4 h-4 ${image.isPrimary ? 'fill-orange-500 text-orange-500' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tip */}
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                    <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-900">
                      Tip: The primary image will be shown first in your business listings
                    </p>
                  </div>

                  {/* Upload Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center transition-colors
                      ${isDragOver ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white'}
                      ${galleryImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={galleryImages.length >= 10}
                    />

                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Portfolio Photos
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop images here, or click to browse. Maximum 10 images, 10MB each. Supported formats: JPEG, PNG, WebP.
                      </p>
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={galleryImages.length >= 10}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Choose Photos
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Account Setup */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Business Summary - At Top */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>

                    <div className="flex gap-6">
                      {/* Primary Image */}
                      {galleryImages.length > 0 && (
                        <div className="flex-shrink-0">
                          <img
                            src={galleryImages.find(img => img.isPrimary)?.url || galleryImages[0].url}
                            alt="Business preview"
                            className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}

                      {/* Business Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{formData.businessName}, {formData.location}</h4>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {formData.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Contact:</span> {formData.firstName} {formData.lastName}</p>
                          <p><span className="font-medium">Email:</span> {formData.email}</p>
                          <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                          {formData.experience && (
                            <p><span className="font-medium">Experience:</span> {formData.experience} years</p>
                          )}
                        </div>

                        {formData.bio && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-900 mb-1">Description:</p>
                            <p className="text-sm text-gray-600">{formData.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Create Account Section - At Bottom */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-6">
                      <Lock className="w-5 h-5 mr-2 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Create Your Account to Publish</h3>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-900">
                        Create a secure password to protect your account. You'll use your email and password to sign in.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
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
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
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
