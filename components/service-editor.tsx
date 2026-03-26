"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogClose, DialogContentSheet, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Plus, Scissors, Image as ImageIcon, Trash2, GripVertical } from "lucide-react"
import type { ServiceItem, ServiceOptionItem } from "@/components/business-form-fields"

interface ServiceEditorProps {
  services: ServiceItem[]
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>
}

export function ServiceEditor({ services, setServices }: ServiceEditorProps) {
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
    setServices(prev => prev.filter(service => service.id !== id))
  }

  const [draggedServiceIndex, setDraggedServiceIndex] = useState<number | null>(null)
  const [dragOverServiceIndex, setDragOverServiceIndex] = useState<number | null>(null)

  const [draggedOptionIndex, setDraggedOptionIndex] = useState<number | null>(null)
  const [dragOverOptionIndex, setDragOverOptionIndex] = useState<number | null>(null)

  const handleOptionDragStart = (e: React.DragEvent, index: number) => {
    setDraggedOptionIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleOptionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedOptionIndex !== null && draggedOptionIndex !== index) {
      setDragOverOptionIndex(index)
    }
  }

  const handleOptionDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedOptionIndex !== null && draggedOptionIndex !== index) {
      setServiceOptions(prev => {
        const newOptions = [...prev]
        const [dragged] = newOptions.splice(draggedOptionIndex, 1)
        newOptions.splice(index, 0, dragged)
        return newOptions
      })
    }
    setDraggedOptionIndex(null)
    setDragOverOptionIndex(null)
  }

  const handleOptionDragEnd = () => {
    setDraggedOptionIndex(null)
    setDragOverOptionIndex(null)
  }

  const handleServiceDragStart = (e: React.DragEvent, index: number) => {
    setDraggedServiceIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleServiceListDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedServiceIndex !== null && draggedServiceIndex !== index) {
      setDragOverServiceIndex(index)
    }
  }

  const handleServiceListDrop = (e: React.DragEvent, index: number) => {
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

  const handleServiceListDragEnd = () => {
    setDraggedServiceIndex(null)
    setDragOverServiceIndex(null)
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
          <DialogContentSheet>
            <div className="p-6 overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <DialogTitle>{editingServiceId ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                <DialogClose className="rounded-sm opacity-70 hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                  <X className="h-5 w-5" />
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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
                      <div
                        key={idx}
                        onDragOver={(e) => handleOptionDragOver(e, idx)}
                        onDrop={(e) => handleOptionDrop(e, idx)}
                        className={`p-3 bg-gray-50 rounded-lg border space-y-2 transition-colors ${
                          draggedOptionIndex === idx ? 'opacity-40' : ''
                        } ${dragOverOptionIndex === idx ? 'border-red-400 bg-red-50/50' : 'border-gray-100'}`}
                      >
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Option Name</Label>
                          <div className="flex items-center gap-2">
                            <div
                              draggable
                              onDragStart={(e) => handleOptionDragStart(e, idx)}
                              onDragEnd={handleOptionDragEnd}
                              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700 flex-shrink-0 p-1"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
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
            </div>
          </DialogContentSheet>
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
                onDragStart={(e) => handleServiceDragStart(e, index)}
                onDragOver={(e) => handleServiceListDragOver(e, index)}
                onDrop={(e) => handleServiceListDrop(e, index)}
                onDragEnd={handleServiceListDragEnd}
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
  )
}
