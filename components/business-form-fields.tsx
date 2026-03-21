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
import { User, Settings, Upload, X, Image as ImageIcon, Plus, Scissors, Loader2, GripVertical, Trash2 } from "lucide-react"
import { SERVICE_TYPES, getSpecialtiesForType, getAdditionalServicesForType, getServicesForSpecialty } from "@/lib/service-types"

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
  service_type: string
  specialties: string
  bio: string
  year_started: string
  booking_link: string
  accepts_same_day: boolean | null
  accepts_mobile: boolean | null
}

export interface ServiceOptionItem {
  name: string
  price: number
  duration: number
  description?: string
}

export interface ServiceItem {
  id: string
  name: string
  price: number
  duration: number
  description?: string
  image_url?: string
  options?: ServiceOptionItem[] | null
}

interface BusinessFormFieldsProps {
  formData: BusinessFormData
  setFormData: React.Dispatch<React.SetStateAction<BusinessFormData>>
  additionalServices: string[]
  setAdditionalServices: React.Dispatch<React.SetStateAction<string[]>>
  specialtyServices: string[]
  setSpecialtyServices: React.Dispatch<React.SetStateAction<string[]>>
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
  specialtyServices,
  setSpecialtyServices,
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
  const [serviceForm, setServiceForm] = useState({ name: "", price: 0, duration: 60, description: "" })
  const [serviceOptions, setServiceOptions] = useState<ServiceOptionItem[]>([])
  const [serviceImagePreview, setServiceImagePreview] = useState<string>('')
  const [isServiceDragOver, setIsServiceDragOver] = useState(false)
  const serviceImageInputRef = useRef<HTMLInputElement>(null)

  // Option handlers
  const addOption = () => {
    setServiceOptions(prev => [...prev, { name: "", price: 0, duration: 60, description: "" }])
  }

  const updateOption = (index: number, field: keyof ServiceOptionItem, value: string | number) => {
    setServiceOptions(prev => prev.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    ))
  }

  const removeOption = (index: number) => {
    setServiceOptions(prev => prev.filter((_, i) => i !== index))
  }

  // Toggle additional service — also creates/removes a service card
  const toggleAdditionalService = (service: string) => {
    if (additionalServices.includes(service)) {
      // Unchecking: remove from additional services and remove the auto-created service card
      setAdditionalServices(prev => prev.filter(s => s !== service))
      setServices(prev => prev.filter(s => !(s.name === service && s.id.startsWith('additional-'))))
    } else {
      // Checking: add to additional services and create a blank service card
      setAdditionalServices(prev => [...prev, service])
      const alreadyExists = services.some(s => s.name === service)
      if (!alreadyExists) {
        const newService: ServiceItem = {
          id: `additional-${Date.now()}-${service.replace(/\s+/g, '-').toLowerCase()}`,
          name: service,
          price: 0,
          duration: 0,
        }
        setServices(prev => [...prev, newService])
      }
    }
  }

  // Toggle specialty service — also creates/removes a service card
  const toggleSpecialtyService = (service: string) => {
    if (specialtyServices.includes(service)) {
      setSpecialtyServices(prev => prev.filter(s => s !== service))
      setServices(prev => prev.filter(s => !(s.name === service && s.id.startsWith('specialty-'))))
    } else {
      setSpecialtyServices(prev => [...prev, service])
      const alreadyExists = services.some(s => s.name === service)
      if (!alreadyExists) {
        const newService: ServiceItem = {
          id: `specialty-${Date.now()}-${service.replace(/\s+/g, '-').toLowerCase()}`,
          name: service,
          price: 0,
          duration: 0,
        }
        setServices(prev => [...prev, newService])
      }
    }
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
    setServiceForm({ name: "", price: 0, duration: 60, description: "" })
    setServiceOptions([{ name: "", price: 0, duration: 60, description: "" }])
    setServiceImagePreview('')
    setIsServiceModalOpen(true)
  }

  const openEditServiceModal = (service: ServiceItem) => {
    setEditingServiceId(service.id)
    setServiceForm({ name: service.name, price: service.price, duration: service.duration, description: service.description || "" })
    const opts = service.options || []
    setServiceOptions(opts.length > 0 ? opts : [{ name: "", price: 0, duration: 60, description: "" }])
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
    const hasOptions = serviceOptions.length > 0
    const validOptions = serviceOptions.filter(opt => opt.name.trim())

    // If no options, require price > 0. If options exist, price is auto-computed.
    if (!serviceForm.name.trim()) return
    if (!hasOptions && serviceForm.price <= 0) return

    // Auto-compute top-level price/duration from options
    const finalPrice = validOptions.length > 0
      ? Math.min(...validOptions.map(o => o.price))
      : serviceForm.price
    const finalDuration = validOptions.length > 0
      ? Math.min(...validOptions.map(o => o.duration)) || 60
      : serviceForm.duration || 60
    const finalOptions = validOptions.length > 0 ? validOptions : null

    if (editingServiceId) {
      setServices(prev => prev.map(service =>
        service.id === editingServiceId
          ? { ...service, name: serviceForm.name, price: finalPrice, duration: finalDuration, description: serviceForm.description, image_url: serviceImagePreview, options: finalOptions }
          : service
      ))
    } else {
      const newService: ServiceItem = {
        id: Date.now().toString(),
        name: serviceForm.name,
        price: finalPrice,
        duration: finalDuration,
        description: serviceForm.description,
        image_url: serviceImagePreview,
        options: finalOptions
      }
      setServices(prev => [...prev, newService])
    }

    setServiceForm({ name: "", price: 0, duration: 60, description: "" })
    setServiceOptions([])
    setServiceImagePreview('')
    setEditingServiceId(null)
    setIsServiceModalOpen(false)
  }

  const handleRemoveService = (id: string) => {
    // If removing an auto-created service from additional services checkbox, uncheck it too
    if (id.startsWith('additional-')) {
      const serviceToRemove = services.find(s => s.id === id)
      if (serviceToRemove) {
        setAdditionalServices(prev => prev.filter(s => s !== serviceToRemove.name))
      }
    }
    setServices(prev => prev.filter(service => service.id !== id))
  }

  const [draggedServiceIndex, setDraggedServiceIndex] = useState<number | null>(null)
  const [dragOverServiceIndex, setDragOverServiceIndex] = useState<number | null>(null)

  const handleServiceReorderDragStart = (e: React.DragEvent, index: number) => {
    setDraggedServiceIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleServiceReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedServiceIndex !== null && draggedServiceIndex !== index) {
      setDragOverServiceIndex(index)
    }
  }

  const handleServiceReorderDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedServiceIndex !== null && draggedServiceIndex !== index) {
      setServices(prev => {
        const newServices = [...prev]
        const [dragged] = newServices.splice(draggedServiceIndex, 1)
        newServices.splice(index, 0, dragged)
        return newServices
      })
    }
    setDraggedServiceIndex(null)
    setDragOverServiceIndex(null)
  }

  const handleServiceReorderDragEnd = () => {
    setDraggedServiceIndex(null)
    setDragOverServiceIndex(null)
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
                Email Address {!isAdminForm && <span className="text-red-600">*</span>}
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
          {/* Service Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Service Type <span className="text-red-600">*</span>
              </Label>
              <Select value={formData.service_type} onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value, specialties: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => {
                    const isDisabled = !isAdminForm && type.value !== 'hairstylist'
                    return (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        disabled={isDisabled}
                      >
                        {type.label}{isDisabled ? ' (Coming Soon)' : ''}
                      </SelectItem>
                    )
                  })}
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

          {/* Specialty & Additional Services - dynamic based on service type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Specialty <span className="text-red-600">*</span>
              </Label>
              <Select value={formData.specialties} onValueChange={(value) => { setFormData(prev => ({ ...prev, specialties: value })); setSpecialtyServices([]) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  {getSpecialtiesForType(formData.service_type || 'hairstylist').map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Specialty Services */}
          {formData.specialties && getServicesForSpecialty(formData.specialties).length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-1 block">
                Services You Offer
              </Label>
              <p className="text-xs text-gray-400 mb-4">Select the {formData.specialties} services you provide</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {getServicesForSpecialty(formData.specialties).map((service) => (
                  <div
                    key={service}
                    onClick={() => toggleSpecialtyService(service)}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={specialtyServices.includes(service)}
                      onChange={() => {}}
                      className="w-4 h-4 text-red-600 border border-input rounded focus:ring-red-500 cursor-pointer"
                    />
                    <span className="ml-2 text-[12.5px] text-gray-600">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Services */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-1 block">
              Additional Services
            </Label>
            <p className="text-xs text-gray-400 mb-4">Select other services you provide apart from your specialty</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {getAdditionalServicesForType(formData.service_type || 'hairstylist').filter(category => category !== formData.specialties).map((service) => (
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
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold rounded-full px-3 py-1">Main Service</span>

                      {/* Image upload */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${
                            isServiceDragOver
                              ? 'border-red-400 bg-red-50'
                              : serviceImagePreview
                                ? 'border-transparent'
                                : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => serviceImageInputRef.current?.click()}
                          onDragOver={handleServiceDragOver}
                          onDragLeave={handleServiceDragLeave}
                          onDrop={handleServiceDrop}
                        >
                          {serviceImagePreview ? (
                            <img src={serviceImagePreview} alt="Service preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className={`w-5 h-5 ${isServiceDragOver ? 'text-red-500' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">Upload Service Image</p>
                          {serviceImagePreview ? (
                            <div className="flex gap-2 mt-1">
                              <button type="button" onClick={() => serviceImageInputRef.current?.click()} className="text-xs text-red-600 hover:underline">Change</button>
                              <button type="button" onClick={() => setServiceImagePreview('')} className="text-xs text-gray-500 hover:underline">Remove</button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">Click square to add image</p>
                          )}
                        </div>
                        <input
                          ref={serviceImageInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          onChange={handleServiceImageSelect}
                          className="hidden"
                        />
                      </div>

                      {/* Service Name */}
                      <div className="space-y-1">
                        <Label>Service Name</Label>
                        <Input
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Box Braids, Silk Press"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea
                          value={serviceForm.description}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this service includes..."
                          className="min-h-[60px] resize-none text-sm"
                        />
                      </div>

                      {/* Price and Duration */}
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                          <div className="space-y-1">
                            <Label>Price (£)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={serviceForm.price || ''}
                              onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Duration</Label>
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
                                    <SelectItem value="9">9 hrs</SelectItem>
                                    <SelectItem value="10">10 hrs</SelectItem>
                                    <SelectItem value="11">11 hrs</SelectItem>
                                    <SelectItem value="12">12 hrs</SelectItem>
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
                                    <SelectItem value="5">5 min</SelectItem>
                                    <SelectItem value="10">10 min</SelectItem>
                                    <SelectItem value="15">15 min</SelectItem>
                                    <SelectItem value="20">20 min</SelectItem>
                                    <SelectItem value="25">25 min</SelectItem>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="35">35 min</SelectItem>
                                    <SelectItem value="40">40 min</SelectItem>
                                    <SelectItem value="45">45 min</SelectItem>
                                    <SelectItem value="50">50 min</SelectItem>
                                    <SelectItem value="55">55 min</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>

                      <div className="pt-4 pb-2">
                        <hr className="border-gray-200" />
                        <p className="text-xs text-gray-400 mt-2 text-center max-w-[240px] mx-auto">If this service comes in different sizes or styles, add them below.</p>
                      </div>

                      {/* Options / Variants */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold rounded-full px-3 py-1">Options / Variants</span>
                          <SmallCtaButton
                            type="button"
                            variant="outline"
                            onClick={addOption}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Option
                          </SmallCtaButton>
                        </div>
                        {serviceOptions.length > 0 && (
                          <div className="space-y-3">
                            {serviceOptions.map((opt, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-500">Option Name</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={opt.name}
                                      onChange={(e) => updateOption(idx, 'name', e.target.value)}
                                      placeholder="e.g. Small, Medium, Large"
                                      className="h-8 text-sm flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeOption(idx)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-500">Description</Label>
                                  <Textarea
                                    value={opt.description || ''}
                                    onChange={(e) => updateOption(idx, 'description', e.target.value)}
                                    placeholder="Describe this option..."
                                    className="min-h-[40px] resize-none text-sm h-8"
                                  />
                                </div>
                                <div className="grid grid-cols-[1fr_2fr] gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">Price (£)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={opt.price || ''}
                                      onChange={(e) => updateOption(idx, 'price', e.target.value === '' ? 0 : Number(e.target.value))}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">Duration</Label>
                                    <div className="grid grid-cols-2 gap-1">
                                      <Select
                                        value={Math.floor((opt.duration || 0) / 60).toString()}
                                        onValueChange={(value) => updateOption(idx, 'duration', (parseInt(value) * 60) + ((opt.duration || 0) % 60))}
                                      >
                                        <SelectTrigger className="h-8 text-sm">
                                          <SelectValue placeholder="Hours" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 13 }, (_, i) => (
                                            <SelectItem key={i} value={i.toString()}>{i === 1 ? '1 hr' : `${i} hrs`}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={((opt.duration || 0) % 60).toString()}
                                        onValueChange={(value) => updateOption(idx, 'duration', (Math.floor((opt.duration || 0) / 60) * 60) + parseInt(value))}
                                      >
                                        <SelectTrigger className="h-8 text-sm">
                                          <SelectValue placeholder="Mins" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 12 }, (_, i) => (
                                            <SelectItem key={i} value={(i * 5).toString()}>{i * 5} min</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
                  {services.map((service, index) => {
                    const isUnfilled = service.price <= 0 && service.duration <= 0
                    return (
                      <div
                        key={service.id}
                        draggable
                        onDragStart={(e) => handleServiceReorderDragStart(e, index)}
                        onDragOver={(e) => handleServiceReorderDragOver(e, index)}
                        onDrop={(e) => handleServiceReorderDrop(e, index)}
                        onDragEnd={handleServiceReorderDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          draggedServiceIndex === index
                            ? 'opacity-40'
                            : dragOverServiceIndex === index
                              ? 'border-red-400 bg-red-50/50'
                              : isUnfilled
                                ? 'bg-amber-50/50 border-amber-200 border-dashed'
                                : 'bg-gray-50 border-gray-100'
                        }`}
                        onClick={() => openEditServiceModal(service)}
                      >
                        <div
                          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        {service.image_url && (
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{service.name}</h4>
                          {isUnfilled ? (
                            <p className="text-xs text-amber-600 mt-1">Tap to add price & duration (optional)</p>
                          ) : (
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-600">{Math.floor(service.duration / 60) > 0 && Math.floor(service.duration / 60) + 'h'}{Math.floor(service.duration / 60) > 0 && service.duration % 60 > 0 && ' '}{service.duration % 60 > 0 && (service.duration % 60) + 'm'}{service.duration === 0 && '0 min'}</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {service.options && service.options.length > 0 ? `from ` : ''}£{service.price}
                              </span>
                              {service.options && service.options.length > 0 && (
                                <span className="text-xs text-gray-400">({service.options.length} options)</span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleRemoveService(service.id) }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
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
                  Drop photos here or tap to add (min 5, max 10, 10MB each). JPEG, PNG, WebP.
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
  service_type: '',
  specialties: '',
  bio: '',
  year_started: '',
  booking_link: '',
  accepts_same_day: null,
  accepts_mobile: null,
}
