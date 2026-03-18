"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, X, Plus, Scissors } from "lucide-react"
import type { ServiceItem, ServiceOptionItem } from "@/components/business-form-fields"

interface ServiceEditorProps {
  services: ServiceItem[]
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>
}

export function ServiceEditor({ services, setServices }: ServiceEditorProps) {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [serviceForm, setServiceForm] = useState({ name: "", price: 0, duration: 60 })
  const [serviceOptions, setServiceOptions] = useState<ServiceOptionItem[]>([])
  const [serviceImagePreview, setServiceImagePreview] = useState<string>('')
  const [isServiceDragOver, setIsServiceDragOver] = useState(false)
  const serviceImageInputRef = useRef<HTMLInputElement>(null)

  // Option handlers
  const addOption = () => {
    setServiceOptions(prev => [...prev, { name: "", price: 0, duration: 60 }])
  }

  const updateOption = (index: number, field: keyof ServiceOptionItem, value: string | number) => {
    setServiceOptions(prev => prev.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    ))
  }

  const removeOption = (index: number) => {
    setServiceOptions(prev => prev.filter((_, i) => i !== index))
  }

  const openAddServiceModal = () => {
    setEditingServiceId(null)
    setServiceForm({ name: "", price: 0, duration: 60 })
    setServiceOptions([])
    setServiceImagePreview('')
    setIsServiceModalOpen(true)
  }

  const openEditServiceModal = (service: ServiceItem) => {
    setEditingServiceId(service.id)
    setServiceForm({ name: service.name, price: service.price, duration: service.duration })
    setServiceOptions(service.options || [])
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

    if (!serviceForm.name.trim()) return
    if (!hasOptions && serviceForm.price <= 0) return

    const finalPrice = validOptions.length > 0
      ? Math.min(...validOptions.map(o => o.price))
      : serviceForm.price
    const finalDuration = validOptions.length > 0
      ? Math.min(...validOptions.map(o => o.duration))
      : serviceForm.duration
    const finalOptions = validOptions.length > 0 ? validOptions : null

    if (editingServiceId) {
      setServices(prev => prev.map(service =>
        service.id === editingServiceId
          ? { ...service, name: serviceForm.name, price: finalPrice, duration: finalDuration, image_url: serviceImagePreview, options: finalOptions }
          : service
      ))
    } else {
      const newService: ServiceItem = {
        id: Date.now().toString(),
        name: serviceForm.name,
        price: finalPrice,
        duration: finalDuration,
        image_url: serviceImagePreview,
        options: finalOptions
      }
      setServices(prev => [...prev, newService])
    }

    setServiceForm({ name: "", price: 0, duration: 60 })
    setServiceOptions([])
    setServiceImagePreview('')
    setEditingServiceId(null)
    setIsServiceModalOpen(false)
  }

  const handleRemoveService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id))
  }

  return (
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

              {/* Service Options */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Size / Option Variants</Label>
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
                  <div className="space-y-3 mt-3">
                    {serviceOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500">Name</Label>
                          <Input
                            value={opt.name}
                            onChange={(e) => updateOption(idx, 'name', e.target.value)}
                            placeholder="e.g. Small, Medium, Large"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <Label className="text-xs text-gray-500">Price (£)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={opt.price || ''}
                            onChange={(e) => updateOption(idx, 'price', e.target.value === '' ? 0 : Number(e.target.value))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <Label className="text-xs text-gray-500">Mins</Label>
                          <Input
                            type="number"
                            min="0"
                            step="5"
                            value={opt.duration || ''}
                            onChange={(e) => updateOption(idx, 'duration', e.target.value === '' ? 0 : Number(e.target.value))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(idx)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400">
                      Top-level price will auto-set to the lowest option price (from £{serviceOptions.filter(o => o.price > 0).length > 0 ? Math.min(...serviceOptions.filter(o => o.price > 0).map(o => o.price)) : '...'})
                    </p>
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
          {services.map((service) => {
            const isUnfilled = service.price <= 0 && service.duration <= 0
            return (
              <div
                key={service.id}
                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer ${
                  isUnfilled
                    ? 'bg-amber-50/50 border-amber-200 border-dashed'
                    : 'bg-gray-50 border-gray-100'
                }`}
                onClick={() => openEditServiceModal(service)}
              >
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
  )
}
