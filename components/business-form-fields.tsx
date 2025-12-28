"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Settings, Upload, X, Image as ImageIcon, Plus, Scissors, Loader2, GripVertical } from "lucide-react"

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

export interface BusinessFormData {
  first_name: string
  last_name: string
  business_name: string
  contact_email: string
  phone: string
  instagram_handle: string
  tiktok_handle: string
  location: string
  business_type: string
  specialties: string
  bio: string
  year_started: string
  booking_link: string
  accepts_same_day: boolean | null
  accepts_mobile: boolean | null
}

export interface ServiceItem {
  id: string
  name: string
  price: number
  duration: number
  image_url?: string
}

interface BusinessFormFieldsProps {
  formData: BusinessFormData
  setFormData: React.Dispatch<React.SetStateAction<BusinessFormData>>
  additionalServices: string[]
  setAdditionalServices: React.Dispatch<React.SetStateAction<string[]>>
  logoImage: string
  setLogoImage: React.Dispatch<React.SetStateAction<string>>
  galleryImages: string[]
  setGalleryImages: React.Dispatch<React.SetStateAction<string[]>>
  services: ServiceItem[]
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>
  isUploading?: boolean
  onUploadImages?: (files: FileList | File[]) => Promise<string[]>
  showServices?: boolean
  isAdminForm?: boolean
}

export function BusinessFormFields({
  formData,
  setFormData,
  additionalServices,
  setAdditionalServices,
  logoImage,
  setLogoImage,
  galleryImages,
  setGalleryImages,
  services,
  setServices,
  isUploading = false,
  onUploadImages,
  showServices = true,
  isAdminForm = false
}: BusinessFormFieldsProps) {
  // Logo state
  const [isLogoDragOver, setIsLogoDragOver] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Gallery state
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Service modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [serviceForm, setServiceForm] = useState({ name: "", price: 0, duration: 60 })
  const [serviceImagePreview, setServiceImagePreview] = useState<string>('')
  const [isServiceDragOver, setIsServiceDragOver] = useState(false)
  const serviceImageInputRef = useRef<HTMLInputElement>(null)

  // Toggle additional service
  const toggleAdditionalService = (service: string) => {
    setAdditionalServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  // Logo handlers
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsLogoDragOver(true)
  }

  const handleLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsLogoDragOver(false)
  }

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsLogoDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setLogoImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoImage('')
  }

  // Gallery handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0 && onUploadImages) {
      const urls = await onUploadImages(files)
      setGalleryImages(prev => [...prev, ...urls].slice(0, 20))
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onUploadImages) {
      const urls = await onUploadImages(files)
      setGalleryImages(prev => [...prev, ...urls].slice(0, 20))
    }
    if (e.target) e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  // Image drag reorder handlers
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedImageIndex !== null && draggedImageIndex !== index) {
      setDragOverImageIndex(index)
    }
  }

  const handleImageDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedImageIndex !== null && draggedImageIndex !== index) {
      const newImages = [...galleryImages]
      const [draggedImage] = newImages.splice(draggedImageIndex, 1)
      newImages.splice(index, 0, draggedImage)
      setGalleryImages(newImages)
    }
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }

  // Service handlers
  const openAddServiceModal = () => {
    setEditingServiceId(null)
    setServiceForm({ name: "", price: 0, duration: 60 })
    setServiceImagePreview('')
    setIsServiceModalOpen(true)
  }

  const openEditServiceModal = (service: ServiceItem) => {
    setEditingServiceId(service.id)
    setServiceForm({ name: service.name, price: service.price, duration: service.duration })
    setServiceImagePreview(service.image_url || '')
    setIsServiceModalOpen(true)
  }

  const handleServiceImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setServiceImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
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
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setServiceImagePreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleAddService = () => {
    if (!serviceForm.name.trim() || serviceForm.price <= 0) return

    if (editingServiceId) {
      setServices(prev => prev.map(service =>
        service.id === editingServiceId
          ? { ...service, name: serviceForm.name, price: serviceForm.price, duration: serviceForm.duration, image_url: serviceImagePreview }
          : service
      ))
    } else {
      const newService: ServiceItem = {
        id: Date.now().toString(),
        name: serviceForm.name,
        price: serviceForm.price,
        duration: serviceForm.duration,
        image_url: serviceImagePreview
      }
      setServices(prev => [...prev, newService])
    }

    setServiceForm({ name: "", price: 0, duration: 60 })
    setServiceImagePreview('')
    setEditingServiceId(null)
    setIsServiceModalOpen(false)
  }

  const handleRemoveService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Section 1: Basic Information */}
      <Card>
        <CardContent className="px-3 py-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
          </div>
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                First Name {!isAdminForm && <span className="text-red-600">*</span>}
              </Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Last Name {!isAdminForm && <span className="text-red-600">*</span>}
              </Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Smith"
              />
            </div>
          </div>

          {/* Business Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Business Name <span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="e.g., Glamour Hair Studio"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Email Address <span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value.toLowerCase() }))}
                placeholder="contact@yourbusiness.com"
                type="email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Phone Number {!isAdminForm && <span className="text-red-600">*</span>}
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="07123 456789"
                type="tel"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Business Instagram
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                <Input
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                  placeholder="yourbusiness"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Business TikTok
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                <Input
                  value={formData.tiktok_handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiktok_handle: e.target.value }))}
                  placeholder="yourbusiness"
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Business Details */}
      <Card>
        <CardContent className="px-3 py-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-semibold text-gray-900">Business Details</h3>
          </div>
          {/* Specialty & Location Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Specialty <span className="text-red-600">*</span>
              </Label>
              <Select value={formData.specialties} onValueChange={(value) => setFormData(prev => ({ ...prev, specialties: value }))}>
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
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Location Type <span className="text-red-600">*</span>
              </Label>
              <Select value={formData.business_type} onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}>
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
              {ADDITIONAL_SERVICES.filter(category => category !== formData.specialties).map((service) => (
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

          {/* Booking Link & Postcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Booking Link <span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.booking_link}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_link: e.target.value }))}
                placeholder="https://your-booking-site.com"
                type="url"
              />
              <p className="text-xs text-gray-400 mt-1">Add your booking page URL (e.g., Calendly, Square, etc.)</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Postcode <span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value.toUpperCase() }))}
                placeholder="SW1A 1AA"
                maxLength={8}
              />
              <p className="text-xs text-gray-400 mt-1">Enter a valid UK postcode</p>
            </div>
          </div>

          {/* Year Started & Same-Day Appointments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Year Started
              </Label>
              <Select value={formData.year_started} onValueChange={(value) => setFormData(prev => ({ ...prev, year_started: value }))}>
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
                  onClick={() => setFormData(prev => ({ ...prev, accepts_same_day: true }))}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.accepts_same_day === true}
                    onChange={() => {}}
                    className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                  />
                  <span className="ml-2 text-[12.5px] text-gray-600">Yes</span>
                </div>
                <div
                  onClick={() => setFormData(prev => ({ ...prev, accepts_same_day: false }))}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.accepts_same_day === false}
                    onChange={() => {}}
                    className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                  />
                  <span className="ml-2 text-[12.5px] text-gray-600">No</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Appointments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Offer Mobile Appointments?
              </Label>
              <div className="flex items-center gap-6 h-10">
                <div
                  onClick={() => setFormData(prev => ({ ...prev, accepts_mobile: true }))}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.accepts_mobile === true}
                    onChange={() => {}}
                    className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                  />
                  <span className="ml-2 text-[12.5px] text-gray-600">Yes</span>
                </div>
                <div
                  onClick={() => setFormData(prev => ({ ...prev, accepts_mobile: false }))}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.accepts_mobile === false}
                    onChange={() => {}}
                    className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                  />
                  <span className="ml-2 text-[12.5px] text-gray-600">No</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Profile Bio <span className="text-red-600">*</span>
            </Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell clients about yourself and your services..."
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Share your story, expertise, and what makes you stand out</p>
          </div>

          {/* Services - integrated into Business Details */}
          {showServices && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-900">Services</Label>
                <Dialog open={isServiceModalOpen} onOpenChange={(open) => {
                  setIsServiceModalOpen(open)
                  if (!open) setIsServiceDragOver(false)
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
                                onClick={() => serviceImageInputRef.current?.click()}
                                className="bg-white/90 hover:bg-white"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Change
                              </Button>
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
                              <Upload className={`w-8 h-8 mx-auto mb-2 ${isServiceDragOver ? 'text-red-500' : 'text-gray-400'}`} />
                              <p className={`text-sm mb-3 ${isServiceDragOver ? 'text-red-600' : 'text-gray-500'}`}>
                                {isServiceDragOver ? 'Drop image here' : 'Drag and drop an image here'}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => serviceImageInputRef.current?.click()}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Select Image
                              </Button>
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
                        <Label>Service Name</Label>
                        <Input
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Box Braids, Silk Press"
                        />
                      </div>

                      {/* Price and Duration */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price (£)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={serviceForm.price || ''}
                            onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <Label>Duration (min)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={serviceForm.duration || ''}
                            onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value === '' ? 0 : Number(e.target.value) }))}
                            placeholder="60"
                          />
                        </div>
                      </div>

                      <Button onClick={handleAddService} className="w-full bg-red-600 hover:bg-red-700">
                        {editingServiceId ? 'Update Service' : 'Add Service'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
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
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg flex flex-col items-center gap-1">
                  <Scissors className="w-6 h-6 text-gray-400 mb-1" />
                  <p className="text-sm font-semibold text-gray-800">Add Your Services</p>
                  <p>Click "Add Service" to get started.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Photos */}
      <Card>
        <CardContent className="px-3 py-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-semibold text-gray-900">Photos</h3>
          </div>
          {/* Logo Upload */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Business Logo</h3>
            <p className="text-xs text-gray-500 mb-4">Upload your business logo (optional)</p>
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
                    src={logoImage}
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
                  Drag a file here or use upload. PNG, JPG, GIF. Max 5MB.
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
                    className="h-7 px-2 text-[10px] font-medium text-gray-600 bg-gray-50/90 hover:bg-gray-100 border border-gray-200"
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
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleLogoSelect}
              className="hidden"
            />
          </div>

          {/* Portfolio Photos */}
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  Portfolio Photos ({galleryImages.length}/10)
                </h4>
                {galleryImages.length > 0 && (
                  <p className="text-xs text-gray-500 hidden sm:block">Drag images to reorder</p>
                )}
              </div>
            </div>

            {/* Image Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {galleryImages.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className={`relative group aspect-[4/3] rounded-lg overflow-hidden cursor-move transition-all duration-150 border-2 ${
                      draggedImageIndex === index
                        ? 'border-red-500 scale-[1.03] shadow-lg z-20 opacity-95'
                        : draggedImageIndex !== null
                          ? 'border-gray-300 opacity-70'
                          : 'border-gray-200 hover:border-red-400'
                    }`}
                    draggable
                    onDragStart={(e) => handleImageDragStart(e, index)}
                    onDragOver={(e) => handleImageDragOver(e, index)}
                    onDrop={(e) => handleImageDrop(e, index)}
                    onDragEnd={handleImageDragEnd}
                  >
                    <img
                      src={imageUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                      Photo {index + 1}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        type="button"
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
                        <X className="w-3 h-3" />
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
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={galleryImages.length >= 10}
              />
              <div className="flex flex-col items-center text-center">
                <Upload className="w-5 h-5 text-gray-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Upload Portfolio Photos
                </h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Drop photos here or tap to add (10 max, 10MB each). JPEG, PNG, WebP.
                </p>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={galleryImages.length >= 10 || isUploading}
                  size="sm"
                  className="h-8 px-3 text-[12px] font-semibold bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Choose Photos'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export initial form data for reuse
export const initialBusinessFormData: BusinessFormData = {
  first_name: '',
  last_name: '',
  business_name: '',
  contact_email: '',
  phone: '',
  instagram_handle: '',
  tiktok_handle: '',
  location: '',
  business_type: '',
  specialties: '',
  bio: '',
  year_started: '',
  booking_link: '',
  accepts_same_day: null,
  accepts_mobile: null,
}
