"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Plus, User, MapPin, Upload, Scissors, Edit, Trash2, Settings, Save, Loader2, X, Search, Filter, MoreHorizontal, Key, UserCheck, UserX, Clock, ExternalLink, ChevronDown, Image, Copy, LayoutDashboard, Star, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { usePortfolioUpload } from "@/hooks/use-portfolio-upload"
import { useAuth } from "@/hooks/use-auth"

const SPECIALTY_CATEGORIES = [
  "Wigs",
  "Braids",
  "Locs",
  "Natural Hair",
  "Bridal Hair",
  "Silk Press"
]

// Interface for pending stylists from database
interface PendingStylist {
  id: string
  business_name: string
  contact_email: string
  phone: string
  location: string
  specialties: string[]
  primary_specialty: string
  year_started: number | null
  bio: string
  portfolio_images: string[]
  logo_url: string | null
  verification_status: string
  submitted_at: string
  user_id: string | null
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [stylists, setStylists] = useState<PendingStylist[]>([])
  const [loadingPendingStylists, setLoadingPendingStylists] = useState(true)
  const [allStylists, setAllStylists] = useState<any[]>([])
  const [loadingStylists, setLoadingStylists] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddingService, setIsAddingService] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [hasFetchedStylists, setHasFetchedStylists] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  // Fetch pending verification stylists
  const fetchPendingStylists = useCallback(async () => {
    setLoadingPendingStylists(true)
    try {
      const { data, error } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('verification_status', 'pending_verification')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending stylists:', error)
        return
      }

      setStylists(data || [])
    } catch (err) {
      console.error('Error fetching pending stylists:', err)
    } finally {
      setLoadingPendingStylists(false)
    }
  }, [])

  // Load pending stylists on mount
  useEffect(() => {
    fetchPendingStylists()
  }, [fetchPendingStylists])

  // Fetch all stylists for manage tab
  const fetchAllStylists = useCallback(async () => {
    setLoadingStylists(true)
    try {
      const { data, error } = await supabase
        .from('stylist_profiles')
        .select(`
          *,
          users:user_id (
            id,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return
      }

      setAllStylists(data || [])
      setHasFetchedStylists(true)
    } catch (err) {
    } finally {
      setLoadingStylists(false)
    }
  }, [])

  // Load stylists when component mounts or when manage tab is accessed
  useEffect(() => {
    if (activeTab === 'manage' && !hasFetchedStylists) {
      fetchAllStylists()
    }
  }, [activeTab, hasFetchedStylists, fetchAllStylists])

  // Filter stylists based on search and status
  const filteredStylists = allStylists.filter(stylist => {
    const matchesSearch = 
      stylist.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stylist.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stylist.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const hasAccount = stylist.user_id !== null
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && hasAccount) ||
      (statusFilter === 'no-account' && !hasAccount)
    
    return matchesSearch && matchesStatus
  })

  // Get account status for a stylist
  const getAccountStatus = (stylist: any) => {
    if (stylist.user_id) {
      return { status: 'active', label: 'Active Account', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'no-account', label: 'No Account', color: 'bg-red-100 text-red-800' }
    }
  }

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Account generation state
  const [createdStylist, setCreatedStylist] = useState<any>(null)
  const [generatingAccount, setGeneratingAccount] = useState(false)
  const [accountCredentials, setAccountCredentials] = useState<{email: string, password: string} | null>(null)
  const [accountError, setAccountError] = useState('')
  
  // Table-specific account generation state
  const [generatingAccountForStylist, setGeneratingAccountForStylist] = useState<string | null>(null)
  const [tableAccountCredentials, setTableAccountCredentials] = useState<{stylist_id: string, email: string, password: string} | null>(null)
  const [tableAccountError, setTableAccountError] = useState('')

  // Delete stylist modal state
  const [deletingStylist, setDeletingStylist] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  
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
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('stylist-portfolios')
          .getPublicUrl(fileName)
        
        uploadedUrls.push(publicUrl)
      }

      return uploadedUrls
    } catch (error) {
      throw error
    }
  }, [user?.id])

  const handleApprove = async (id: string) => {
    setApprovingId(id)
    try {
      const { error } = await supabase
        .from('stylist_profiles')
        .update({
          verification_status: 'approved',
          is_active: true,
          is_verified: true
        })
        .eq('id', id)

      if (error) {
        console.error('Error approving stylist:', error)
        return
      }

      // Remove from pending list
      setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
      // Refresh all stylists if already loaded
      if (hasFetchedStylists) {
        fetchAllStylists()
      }
    } catch (err) {
      console.error('Error approving stylist:', err)
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setRejectingId(id)
    try {
      const { error } = await supabase
        .from('stylist_profiles')
        .update({
          verification_status: 'rejected',
          is_active: false
        })
        .eq('id', id)

      if (error) {
        console.error('Error rejecting stylist:', error)
        return
      }

      // Remove from pending list
      setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
    } catch (err) {
      console.error('Error rejecting stylist:', err)
    } finally {
      setRejectingId(null)
    }
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
    
    // Clear any previous stylist state when starting a new profile creation
    setCreatedStylist(null)
    setAccountCredentials(null)
    
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

      // Use the actual uploaded image URLs
      const portfolioImages = galleryImages

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
        throw new Error(`Database error: ${insertError.message || insertError.details || 'Unknown database error'}`)
      }

      const stylistId = data[0].id
      
      // Save services if any have been added
      let servicesSaveFailed = false
      let servicesFailReason = ''

      if (mockServices.length > 0) {
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
            // Check if it's an RLS policy error
            if (result.details?.code === '42501') {
              // Set a flag to show this in the success message
              servicesSaveFailed = true
              servicesFailReason = 'Database permissions required (service role key needed)'
            }
          }
        } catch (apiError) {
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

      // Store created stylist data for account generation
      setCreatedStylist(data[0])
      setAccountCredentials(null) // Reset any previous credentials
      
      // Reset form and clear all images
      setFormData({
        business_name: '',
        bio: '',
        location: '',
        specialties: '',
        years_experience: 0,
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
      setError(err.message || 'Failed to create stylist profile')
    } finally {
      setSaving(false)
    }
  }

  // Generate secure random password
  const generateSecurePassword = (): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'
    const allChars = lowercase + uppercase + numbers + symbols
    
    let password = ''
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Add remaining characters
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  // Generate login account for created stylist
  const handleGenerateAccount = async () => {
    if (!createdStylist) return

    setAccountError('')
    setGeneratingAccount(true)
    
    try {
      const tempPassword = generateSecurePassword()
      
      // Call API to create user account
      const response = await fetch('/api/admin/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: createdStylist.contact_email,
          password: tempPassword,
          stylist_id: createdStylist.id,
          business_name: createdStylist.business_name
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }
      
      // Store credentials for display
      setAccountCredentials({
        email: createdStylist.contact_email,
        password: tempPassword
      })
      
      // Update created stylist with user_id
      setCreatedStylist({
        ...createdStylist,
        user_id: result.user_id
      })

    } catch (err: any) {
      setAccountError(err.message || 'Failed to generate account')
    } finally {
      setGeneratingAccount(false)
    }
  }

  // Copy credentials to clipboard
  const copyCredentials = async () => {
    if (!accountCredentials) return

    const credentialsText = `Login Credentials for ${createdStylist?.business_name}:
Email: ${accountCredentials.email}
Temporary Password: ${accountCredentials.password}

Please change your password after first login.`

    try {
      await navigator.clipboard.writeText(credentialsText)
      // Could add a toast notification here
    } catch (err) {
    }
  }

  // Reset to start over
  const resetCreationState = () => {
    setCreatedStylist(null)
    setAccountCredentials(null)
    setAccountError('')
    setError('')
    setSuccess('')
  }

  // Generate account for table stylist
  const handleTableGenerateAccount = async (stylist: any) => {
    if (!stylist.contact_email) {
      setTableAccountError('Stylist must have an email address to generate an account')
      return
    }

    setTableAccountError('')
    setGeneratingAccountForStylist(stylist.id)
    
    try {
      const tempPassword = generateSecurePassword()
      
      // Call API to create user account
      const response = await fetch('/api/admin/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: stylist.contact_email,
          password: tempPassword,
          stylist_id: stylist.id,
          business_name: stylist.business_name
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }
      
      // Store credentials for display
      setTableAccountCredentials({
        stylist_id: stylist.id,
        email: stylist.contact_email,
        password: tempPassword
      })
      
      // Update the local stylists list to reflect the new account
      setAllStylists(prevStylists => 
        prevStylists.map(s => 
          s.id === stylist.id 
            ? { ...s, user_id: result.user_id, users: { id: result.user_id, email: stylist.contact_email } }
            : s
        )
      )

    } catch (err: any) {
      setTableAccountError(err.message || 'Failed to generate account')
    } finally {
      setGeneratingAccountForStylist(null)
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (stylist: any) => {
    setDeletingStylist(stylist)
    setDeleteError('')
    setDeleteSuccess(false)
  }

  // Close delete modal
  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeletingStylist(null)
      setDeleteError('')
      setDeleteSuccess(false)
    }
  }

  // Delete stylist
  const handleDeleteStylist = async () => {
    if (!deletingStylist) return

    setIsDeleting(true)
    setDeleteError('')

    try {
      const { error } = await supabase
        .from('stylist_profiles')
        .delete()
        .eq('id', deletingStylist.id)

      if (error) throw error

      // Update the local state to remove the deleted stylist
      setAllStylists(prevStylists => prevStylists.filter(s => s.id !== deletingStylist.id))

      setDeleteSuccess(true)

      // Close modal after a brief delay to show success message
      setTimeout(() => {
        closeDeleteModal()
      }, 1500)

    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete stylist')
    } finally {
      setIsDeleting(false)
    }
  }

  // Copy table credentials to clipboard
  const copyTableCredentials = async (credentials: {stylist_id: string, email: string, password: string}) => {
    const stylist = allStylists.find(s => s.id === credentials.stylist_id)
    const credentialsText = `Login Credentials for ${stylist?.business_name || 'Stylist'}:
Email: ${credentials.email}
Temporary Password: ${credentials.password}

Please change your password after first login.`

    try {
      await navigator.clipboard.writeText(credentialsText)
      // Could add a toast notification here
    } catch (err) {
    }
  }

  // Close table credentials modal
  const closeTableCredentials = () => {
    setTableAccountCredentials(null)
    setTableAccountError('')
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
    if (!validateServiceForm()) {
      return
    }

    const serviceData = {
      id: editingService?.id || Date.now().toString(),
      name: serviceForm.name,
      price: serviceForm.price,
      duration: serviceForm.duration,
      image_url: serviceImagePreview
    }

    if (editingService) {
      // Update existing service
      setMockServices(prev => {
        const updated = prev.map(service =>
          service.id === editingService.id ? serviceData : service
        )
        return updated
      })
      alert(`Service "${serviceForm.name}" updated successfully!`)
    } else {
      // Add new service
      setMockServices(prev => {
        const newServices = [serviceData, ...prev]
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

    } catch (err) {
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
    } catch (err) {
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-lg px-6 py-8 mb-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wider text-red-600 uppercase">
            Admin Dashboard
          </p>
          <h1 className="text-4xl font-bold text-gray-900">
            Platform Management
          </h1>
          <p className="text-base text-red-700/80 mt-3">
            Manage stylists, services, and platform operations
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 p-0 h-auto gap-6 flex-wrap justify-start rounded-none w-full">
          <TabsTrigger
            value="dashboard"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-red-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-red-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Pending Verification
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-red-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Manage Stylists
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-red-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Stylist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Stylists */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stylists</CardTitle>
                <User className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allStylists.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {allStylists.filter(s => s.user_id).length} with accounts
                </p>
              </CardContent>
            </Card>

            {/* Active Stylists */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allStylists.filter(s => s.user_id).length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Stylists with active accounts
                </p>
              </CardContent>
            </Card>

            {/* No Account */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Account</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allStylists.filter(s => !s.user_id).length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Stylists without accounts
                </p>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stylists.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Applications awaiting verification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Verification Carousel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Verification</CardTitle>
                <CardDescription>Stylists awaiting approval</CardDescription>
              </div>
              {stylists.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => {
                    // Switch to pending tab
                    const pendingTab = document.querySelector('[value="pending"]') as HTMLElement
                    if (pendingTab) pendingTab.click()
                  }}
                >
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {stylists.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
                  <p className="mt-1 text-sm text-gray-500">All stylist applications have been processed.</p>
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {stylists.map((stylist, index) => {
                    const placeholderImages = [
                      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop'
                    ]
                    const placeholderImage = placeholderImages[index % placeholderImages.length]
                    const displayImage = stylist.portfolio_images?.[0] || stylist.logo_url || placeholderImage

                    return (
                      <div key={stylist.id} className="flex-none w-[280px]">
                        <Card className="group cursor-pointer hover:shadow-sm transition-shadow h-full">
                          <CardContent className="p-0 h-full">
                            <div className="relative aspect-square md:aspect-[4/3]">
                              <img
                                src={displayImage}
                                alt={stylist.business_name}
                                className="w-full h-full object-cover rounded-t-lg"
                              />
                              <div className="absolute top-3 right-3 flex gap-2">
                                <Button
                                  size="icon"
                                  className="bg-green-600 hover:bg-green-700 h-9 w-9 shadow-md rounded-md"
                                  disabled={approvingId === stylist.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleApprove(stylist.id)
                                  }}
                                >
                                  {approvingId === stylist.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Check className="h-5 w-5" strokeWidth={3} />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  className="bg-red-600 hover:bg-red-700 h-9 w-9 shadow-md rounded-md"
                                  disabled={rejectingId === stylist.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleReject(stylist.id)
                                  }}
                                >
                                  {rejectingId === stylist.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <X className="h-5 w-5" strokeWidth={3} />
                                  )}
                                </Button>
                              </div>
                              <Badge className="absolute top-3 left-3 bg-orange-600 hover:bg-orange-700">
                                Pending
                              </Badge>
                            </div>

                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">{stylist.business_name}</h3>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-gray-700 text-sm">New</span>
                                  <span className="text-gray-500 text-sm">(0)</span>
                                </div>
                              </div>

                              <div className="flex items-center text-gray-600 mb-3">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{stylist.location}</span>
                              </div>

                              <div className="mb-3">
                                <span className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                  {stylist.primary_specialty || stylist.specialties?.[0] ? `${stylist.primary_specialty || stylist.specialties?.[0]} Specialist` : 'Hair Specialist'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Stylists Awaiting Verification</CardTitle>
              <CardDescription>Review and approve or reject stylist applications</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {stylists.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
                  <p className="mt-1 text-sm text-gray-500">All stylist applications have been processed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stylists.map((stylist, index) => {
                    // Generate different placeholder images for each card
                    const placeholderImages = [
                      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop'
                    ]
                    const placeholderImage = placeholderImages[index % placeholderImages.length]
                    const displayImage = stylist.portfolio_images?.[0] || stylist.logo_url || placeholderImage

                    return (
                    <Card key={stylist.id} className="group cursor-pointer hover:shadow-sm transition-shadow h-full">
                      <CardContent className="p-0 h-full">
                        <div className="relative aspect-square md:aspect-[4/3]">
                          <img
                            src={displayImage}
                            alt={stylist.business_name}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button
                              size="icon"
                              className="bg-green-600 hover:bg-green-700 h-9 w-9 shadow-md rounded-md"
                              disabled={approvingId === stylist.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(stylist.id)
                              }}
                            >
                              {approvingId === stylist.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Check className="h-5 w-5" strokeWidth={3} />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              className="bg-red-600 hover:bg-red-700 h-9 w-9 shadow-md rounded-md"
                              disabled={rejectingId === stylist.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReject(stylist.id)
                              }}
                            >
                              {rejectingId === stylist.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <X className="h-5 w-5" strokeWidth={3} />
                              )}
                            </Button>
                          </div>
                          <Badge className="absolute top-3 left-3 bg-orange-600 hover:bg-orange-700">
                            Pending
                          </Badge>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{stylist.business_name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-gray-700 text-sm">New</span>
                              <span className="text-gray-500 text-sm">(0)</span>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{stylist.location}</span>
                          </div>

                          <div className="mb-3">
                            <span className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                              {stylist.primary_specialty || stylist.specialties?.[0] ? `${stylist.primary_specialty || stylist.specialties?.[0]} Specialist` : 'Hair Specialist'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Stylists</CardTitle>
                  <CardDescription>View and manage all stylist profiles and their account status</CardDescription>
                </div>
                <Button 
                  onClick={() => window.location.href = '#create'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Stylist
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stylists</SelectItem>
                    <SelectItem value="active">Active Accounts</SelectItem>
                    <SelectItem value="no-account">No Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredStylists.length} of {allStylists.length} stylists
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAllStylists}
                  disabled={loadingStylists}
                >
                  {loadingStylists ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>

              {/* Stylists Table */}
              {loadingStylists ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                  <span className="ml-2 text-gray-600">Loading stylists...</span>
                </div>
              ) : filteredStylists.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stylists found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Start by creating your first stylist profile.'
                    }
                  </p>
                  {(!searchTerm && statusFilter === 'all') && (
                    <Button 
                      onClick={() => window.location.href = '#create'}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Stylist
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">Stylist</th>
                          <th className="text-left p-4 font-medium text-gray-900">Contact</th>
                          <th className="text-left p-4 font-medium text-gray-900">Location</th>
                          <th className="text-left p-4 font-medium text-gray-900">Account Status</th>
                          <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStylists.map((stylist) => {
                          const accountStatus = getAccountStatus(stylist)
                          
                          return (
                            <tr key={stylist.id} className="hover:bg-gray-50">
                              {/* Stylist Info */}
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={stylist.portfolio_images?.[0]} />
                                    <AvatarFallback>
                                      {stylist.business_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {stylist.business_name || 'Unnamed Business'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {stylist.specialties?.[0] || 'No specialty'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Contact */}
                              <td className="p-4">
                                <div className="text-sm">
                                  <div className="text-gray-900">
                                    {stylist.contact_email || stylist.users?.email || 'No email'}
                                  </div>
                                  {stylist.phone && (
                                    <div className="text-gray-500">{stylist.phone}</div>
                                  )}
                                </div>
                              </td>

                              {/* Location */}
                              <td className="p-4">
                                <div className="text-sm text-gray-900">
                                  {stylist.location || 'No location'}
                                </div>
                              </td>


                              {/* Account Status */}
                              <td className="p-4">
                                <Badge variant="secondary" className={accountStatus.color}>
                                  {accountStatus.status === 'active' ? (
                                    <UserCheck className="w-3 h-3 mr-1" />
                                  ) : (
                                    <UserX className="w-3 h-3 mr-1" />
                                  )}
                                  {accountStatus.label}
                                </Badge>
                              </td>

                              {/* Actions */}
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  {accountStatus.status === 'no-account' ? (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 px-3 py-2 w-[180px] disabled:bg-gray-300 disabled:cursor-not-allowed"
                                      disabled={generatingAccountForStylist === stylist.id || !stylist.contact_email}
                                      onClick={() => handleTableGenerateAccount(stylist)}
                                      title={!stylist.contact_email ? 'Stylist must have an email address to generate an account' : ''}
                                    >
                                      {generatingAccountForStylist === stylist.id ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Generating...
                                        </>
                                      ) : !stylist.contact_email ? (
                                        <>
                                          <UserX className="w-3 h-3 mr-1" />
                                          No Email
                                        </>
                                      ) : (
                                        <>
                                          <Key className="w-3 h-3 mr-1" />
                                          Generate Account
                                        </>
                                      )}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="px-3 py-2 w-[180px]"
                                      onClick={() => {
                                        alert('Password reset functionality will be implemented next')
                                      }}
                                    >
                                      <Key className="w-3 h-3 mr-1" />
                                      Reset Password
                                    </Button>
                                  )}
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      window.open(`/stylist/${stylist.id}`, '_blank')
                                    }}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      alert('Edit functionality will be added to the Create tab')
                                    }}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    onClick={() => openDeleteModal(stylist)}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Credentials Modal */}
          <Dialog open={!!tableAccountCredentials} onOpenChange={(open) => {
            if (!open) closeTableCredentials()
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Account Created Successfully
                </DialogTitle>
              </DialogHeader>
              {tableAccountCredentials && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">
                      Account for {allStylists.find(s => s.id === tableAccountCredentials.stylist_id)?.business_name}
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Login credentials have been generated successfully.
                    </p>
                    
                    <div className="bg-white rounded border p-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Email:</span> {tableAccountCredentials.email}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Temporary Password:</span>
                        <code className="ml-1 px-1 bg-gray-100 rounded text-xs break-all">
                          {tableAccountCredentials.password}
                        </code>
                      </div>
                    </div>
                  </div>

                  {tableAccountError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{tableAccountError}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => copyTableCredentials(tableAccountCredentials)}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Credentials
                    </Button>
                    <Button 
                      onClick={closeTableCredentials}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Share these credentials with the stylist. They should change their password after first login.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Stylist Confirmation Modal */}
          <Dialog open={!!deletingStylist} onOpenChange={(open) => {
            if (!open) closeDeleteModal()
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                  Delete Stylist
                </DialogTitle>
              </DialogHeader>
              {deletingStylist && (
                <div className="space-y-4">
                  {!deleteSuccess ? (
                    <>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-900 mb-2">
                          Are you sure you want to delete <strong>{deletingStylist.business_name}</strong>?
                        </p>
                        <p className="text-xs text-red-700">
                          This action cannot be undone. All stylist data, services, and portfolio images will be permanently deleted.
                        </p>
                      </div>

                      {deleteError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-600">{deleteError}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleDeleteStylist}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700 flex-1"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Stylist
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={closeDeleteModal}
                          disabled={isDeleting}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center text-green-900 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <p className="font-medium">Stylist deleted successfully</p>
                      </div>
                      <p className="text-sm text-green-700">
                        {deletingStylist.business_name} has been removed from the system.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
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
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-red-600" />
                  Profile Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-4 sm:p-6">
              {/* 1. LOGO SECTION */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Logo</h3>
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
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-5">
                    {/* Business Name */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Business Name <span className="text-red-500">*</span></label>
                      <Input
                        value={formData.business_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                        placeholder="Your business name"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Postcode <span className="text-red-500">*</span></label>
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
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Specialty <span className="text-red-500">*</span></label>
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
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Bio <span className="text-red-500">*</span></label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell clients about yourself and your services..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">Years of Experience</label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={formData.years_experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                        placeholder="Years"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
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
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-red-600" />
                  Gallery Settings
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
              {/* Current Gallery */}
              <div>
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      Current Gallery ({galleryImages.length}/20)
                    </h4>
                    {galleryImages.length > 0 && (
                      <p className="text-xs text-gray-500 hidden sm:block">Drag images to reorder</p>
                    )}
                  </div>
                  {galleryImages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 sm:hidden">Drag images to reorder</p>
                  )}
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                  {galleryImages.length === 0 ? (
                    <div className="col-span-3 lg:col-span-5 text-center py-8 text-gray-500">
                      <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
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

          {/* Services Card */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Scissors className="w-5 h-5 mr-2 text-red-600" />
                    Services
                  </CardTitle>
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
                      size="sm"
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
            <CardContent className="p-4 sm:p-6">
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Access Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-red-600" />
                Account Access
              </CardTitle>
              <CardDescription>
                Create stylist profile and generate login credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              {/* Profile Status */}
              {!createdStylist ? (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Profile Status</h4>
                      <p className="text-sm text-gray-500 mt-1">Complete the form above to create a new stylist profile</p>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Not Created
                    </Badge>
                  </div>
                  
                  {/* Action Buttons Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Create Profile Button */}
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

                    {/* Generate Account Button */}
                    <Button 
                      onClick={handleGenerateAccount}
                      disabled={!createdStylist || generatingAccount}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {generatingAccount ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Account...</>
                      ) : (
                        <><User className="w-4 h-4 mr-2" />Generate Login Account</>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-green-900 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Profile Created Successfully
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        Business: {createdStylist.business_name}
                      </p>
                      <p className="text-sm text-green-700">
                        Email: {createdStylist.contact_email}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✅ Created
                    </Badge>
                  </div>
                  
                  {/* Action Buttons Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Create Profile Button */}
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

                    {/* Generate Account Button */}
                    <Button 
                      onClick={handleGenerateAccount}
                      disabled={!createdStylist || generatingAccount}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {generatingAccount ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Account...</>
                      ) : (
                        <><User className="w-4 h-4 mr-2" />Generate Login Account</>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Account Status */}
              {createdStylist && (
                  <div className={`rounded-lg p-4 border ${
                    accountCredentials 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium ${
                        accountCredentials ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        Login Account Status
                      </h4>
                      <Badge variant="secondary" className={
                        accountCredentials 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {accountCredentials ? '✅ Account Created' : 'No login account'}
                      </Badge>
                    </div>

                    {accountCredentials ? (
                      <div className="bg-white rounded border p-3">
                        <h5 className="font-medium text-sm mb-2">Login Credentials</h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Email:</span> {accountCredentials.email}
                          </div>
                          <div>
                            <span className="font-medium">Temporary Password:</span> 
                            <code className="ml-1 px-1 bg-gray-100 rounded text-xs">{accountCredentials.password}</code>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button 
                            onClick={copyCredentials}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Credentials
                          </Button>
                          <Button 
                            onClick={resetCreationState}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Another
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Share these credentials with the stylist. They should change their password after first login.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-700">
                        Click "Generate Login Account" button above to create login credentials for this stylist.
                      </p>
                    )}

                    {accountError && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                        <p className="text-sm text-red-600">{accountError}</p>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard
