"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Plus, User, MapPin, Upload, Scissors, Edit, Trash2, Settings, Save, Loader2, X, Search, Filter, MoreHorizontal, Key, UserCheck, UserX, Clock, ExternalLink, ChevronDown, Image, Copy, LayoutDashboard, Star, Check, Eye, Mail, Phone, Calendar, Briefcase } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { usePortfolioUpload } from "@/hooks/use-portfolio-upload"
import { useAuth } from "@/hooks/use-auth"
import { formatDistanceToNow, format } from "date-fns"
import { BusinessFormFields, BusinessFormData, ServiceItem, initialBusinessFormData } from "@/components/business-form-fields"
import { cn } from "@/lib/utils"

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

import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { DashboardHero } from "@/components/ui/dashboard-hero"
import { SectionHeader } from "@/components/ui/section-header"

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
  booking_link: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  business_type: string | null
  accepts_same_day: boolean | null
  accepts_mobile: boolean | null
  additional_services: string[] | null
}

export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
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
  const [selectedStylist, setSelectedStylist] = useState<PendingStylist | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Edit mode state
  const [editingStylistId, setEditingStylistId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loadingEditData, setLoadingEditData] = useState(false)

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
  const statsRef = useRef<HTMLDivElement>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<{file: File, progress: number, status: string}[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  // Drag and drop state for gallery reordering
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Form state for creating new stylist - uses shared type
  const [formData, setFormData] = useState<BusinessFormData>(initialBusinessFormData)

  // Additional services state
  const [additionalServices, setAdditionalServices] = useState<string[]>([])

  // Logo state
  const [logoImage, setLogoImage] = useState<string>('')

  // Services state for shared component
  const [formServices, setFormServices] = useState<ServiceItem[]>([])

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
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Only JPG, PNG, GIF, WEBP, and HEIC files are allowed.`)
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
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', id)

      if (error) {
        console.error('Error approving stylist:', error)
        return
      }

      // Remove from pending list
      setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
      // Close details modal if open
      if (selectedStylist?.id === id) {
        setShowDetailsModal(false)
        setSelectedStylist(null)
      }
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

  const handleReject = async (id: string, reason?: string) => {
    setRejectingId(id)
    try {
      const { error } = await supabase
        .from('stylist_profiles')
        .update({
          verification_status: 'rejected',
          is_active: false,
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          rejection_reason: reason || null
        })
        .eq('id', id)

      if (error) {
        console.error('Error rejecting stylist:', error)
        return
      }

      // Remove from pending list
      setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
      // Close details modal if open
      if (selectedStylist?.id === id) {
        setShowDetailsModal(false)
        setSelectedStylist(null)
      }
    } catch (err) {
      console.error('Error rejecting stylist:', err)
    } finally {
      setRejectingId(null)
    }
  }

  // Helper to format submission date
  const formatSubmittedDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const openPreview = (stylistId: string) => {
    router.push(`/admin/pending-preview/${stylistId}`)
  }

  // Open details modal
  const openDetailsModal = (stylist: PendingStylist) => {
    setSelectedStylist(stylist)
    setShowDetailsModal(true)
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
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        throw new Error('First name and last name are required')
      }

      if (!formData.business_name.trim()) {
        throw new Error('Business name is required')
      }

      if (!formData.contact_email.trim()) {
        throw new Error('Email is required')
      }

      if (!formData.phone.trim()) {
        throw new Error('Phone number is required')
      }

      if (!formData.location.trim()) {
        throw new Error('Postcode is required')
      }

      if (!formData.business_type) {
        throw new Error('Please select a location type')
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

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate URL format if provided
      if (formData.booking_link && !formData.booking_link.startsWith('http')) {
        throw new Error('Booking link must start with http:// or https://')
      }

      // Use the actual uploaded image URLs
      const portfolioImages = galleryImages

      // Create profile with pending verification status
      const { data, error: insertError } = await supabase
        .from('stylist_profiles')
        .insert([
          {
            business_name: formData.business_name,
            bio: formData.bio,
            location: formData.location.toUpperCase(),
            specialties: formData.specialties ? [formData.specialties] : [],
            primary_specialty: formData.specialties,
            additional_services: additionalServices,
            year_started: formData.year_started ? parseInt(formData.year_started) : null,
            booking_link: formData.booking_link || null,
            phone: formData.phone,
            contact_email: formData.contact_email,
            instagram_handle: formData.instagram_handle || null,
            tiktok_handle: formData.tiktok_handle || null,
            business_type: formData.business_type,
            accepts_same_day: formData.accepts_same_day,
            accepts_mobile: formData.accepts_mobile,
            logo_url: logoImage || null,
            portfolio_images: portfolioImages,
            // Set to pending verification
            verification_status: 'pending_verification',
            submitted_at: new Date().toISOString(),
            is_active: false,
            is_verified: false,
            rating: 0,
            total_reviews: 0
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
      
      let successMessage = `Stylist profile created and added to pending verification! Business: ${formData.business_name}.`

      if (galleryImages.length > 0) {
        successMessage += ` ${galleryImages.length} portfolio images saved.`
      }

      if (mockServices.length > 0) {
        if (servicesSaveFailed) {
          successMessage += ` ${mockServices.length} services were configured but could not be saved to database (${servicesFailReason}).`
        } else {
          successMessage += ` ${mockServices.length} services added.`
        }
      }

      successMessage += ` You can approve it from the Pending tab or generate login credentials below.`

      setSuccess(successMessage)

      // Store created stylist data for account generation
      setCreatedStylist(data[0])
      setAccountCredentials(null) // Reset any previous credentials

      // Refresh pending stylists list
      fetchPendingStylists()

      // Reset form and clear all images
      setFormData(initialBusinessFormData)

      // Clear additional state
      setAdditionalServices([])
      setLogoImage('')
      setFormServices([])
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

  // Load a stylist for editing
  const loadStylistForEdit = async (stylist: any) => {
    setLoadingEditData(true)
    setError('')

    try {
      // Fetch services for this stylist
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('stylist_id', stylist.id)
        .order('created_at', { ascending: false })

      // Populate form with stylist data
      const resolvedYearStarted = stylist.year_started
        ? String(stylist.year_started)
        : stylist.years_experience
          ? String(new Date().getFullYear() - stylist.years_experience)
          : ''

      setFormData({
        first_name: stylist.first_name || '',
        last_name: stylist.last_name || '',
        business_name: stylist.business_name || '',
        contact_email: stylist.contact_email || '',
        phone: stylist.phone || '',
        instagram_handle: stylist.instagram_handle || '',
        tiktok_handle: stylist.tiktok_handle || '',
        location: stylist.location || '',
        business_type: stylist.business_type || '',
        specialties: (stylist.specialties && stylist.specialties.length > 0) ? stylist.specialties[0] : '',
        bio: stylist.bio || '',
        year_started: resolvedYearStarted,
        booking_link: stylist.booking_link || '',
        accepts_same_day: stylist.accepts_same_day ?? null,
        accepts_mobile: stylist.accepts_mobile ?? null,
      })

      const servicesToSet = stylist.additional_services || []
      console.log('🔍 [ADMIN-DASHBOARD] Setting additional services:', servicesToSet)
      setAdditionalServices(servicesToSet)
      setLogoImage(stylist.logo_url || '')
      setGalleryImages(stylist.portfolio_images || [])

      // Load services if available
      console.log('🔍 [ADMIN-DASHBOARD] Loading services for edit:', {
        stylist_name: stylist.business_name,
        services_count: servicesData?.length || 0,
        services: servicesData,
        servicesError: servicesError,
        additional_services: stylist.additional_services
      })

      if (servicesData && !servicesError) {
        const convertedServices = servicesData.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: parseFloat(s.price) / 100, // Convert from pence to pounds
          duration: s.duration,
          image_url: s.image_url || ''
        }))
        console.log('🔍 [ADMIN-DASHBOARD] Converted services to set:', convertedServices)
        setFormServices(convertedServices)
      } else {
        console.log('❌ [ADMIN-DASHBOARD] No services data or error occurred')
        setFormServices([])
      }

      // Set edit mode
      setEditingStylistId(stylist.id)
      setIsEditMode(true)
      setActiveTab('create')

    } catch (err: any) {
      setError('Failed to load stylist data for editing')
    } finally {
      setLoadingEditData(false)
    }
  }

  // Reset edit mode and clear form
  const resetEditMode = () => {
    setIsEditMode(false)
    setEditingStylistId(null)
    setFormData(initialBusinessFormData)
    setAdditionalServices([])
    setLogoImage('')
    setGalleryImages([])
    setMockServices([])
    setError('')
    setSuccess('')
  }

  // Update existing stylist
  const handleUpdateStylist = async () => {
    if (!editingStylistId) return

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        throw new Error('First name and last name are required')
      }

      if (!formData.business_name.trim()) {
        throw new Error('Business name is required')
      }

      if (!formData.contact_email.trim()) {
        throw new Error('Email is required')
      }

      if (!formData.phone.trim()) {
        throw new Error('Phone number is required')
      }

      if (!formData.location.trim()) {
        throw new Error('Postcode is required')
      }

      if (!formData.business_type) {
        throw new Error('Please select a location type')
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

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate URL format if provided
      if (formData.booking_link && !formData.booking_link.startsWith('http')) {
        throw new Error('Booking link must start with http:// or https://')
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('stylist_profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          business_name: formData.business_name,
          bio: formData.bio,
          location: formData.location.toUpperCase(),
          specialties: formData.specialties ? [formData.specialties] : [],
          primary_specialty: formData.specialties,
          additional_services: additionalServices,
          year_started: formData.year_started ? parseInt(formData.year_started) : null,
          booking_link: formData.booking_link || null,
          phone: formData.phone,
          contact_email: formData.contact_email,
          instagram_handle: formData.instagram_handle || null,
          tiktok_handle: formData.tiktok_handle || null,
          business_type: formData.business_type,
          accepts_same_day: formData.accepts_same_day,
          accepts_mobile: formData.accepts_mobile,
          logo_url: logoImage || null,
          portfolio_images: galleryImages,
        })
        .eq('id', editingStylistId)

      if (updateError) {
        throw new Error(`Database error: ${updateError.message || updateError.details || 'Unknown database error'}`)
      }

      // Update services
      // First get existing services
      const { data: existingServices } = await supabase
        .from('services')
        .select('id')
        .eq('stylist_id', editingStylistId)

      const existingIds = new Set((existingServices || []).map(s => s.id))
      const newServiceIds = new Set(formServices.map(s => s.id))

      // Delete removed services
      const toDelete = [...existingIds].filter(id => !newServiceIds.has(id))
      if (toDelete.length > 0) {
        await supabase
          .from('services')
          .delete()
          .in('id', toDelete)
      }

      // Update or insert services
      for (const service of formServices) {
        if (existingIds.has(service.id)) {
          // Update existing service
          await supabase
            .from('services')
            .update({
              name: service.name,
              price: service.price * 100, // Convert pounds to pence
              duration: service.duration,
              image_url: service.image_url || null
            })
            .eq('id', service.id)
        } else {
          // Insert new service
          await supabase
            .from('services')
            .insert({
              stylist_id: editingStylistId,
              name: service.name,
              price: service.price * 100, // Convert pounds to pence
              duration: service.duration,
              image_url: service.image_url || null
            })
        }
      }

      setSuccess(`Stylist profile "${formData.business_name}" updated successfully!`)

      // Refresh stylists list
      fetchAllStylists()

      // Reset edit mode after short delay to show success message
      setTimeout(() => {
        resetEditMode()
        setActiveTab('manage')
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Failed to update stylist profile')
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
    setFormData(initialBusinessFormData)
    setAdditionalServices([])
    setLogoImage('')
    setFormServices([])
    setError('')
    setSuccess('')
    // Also reset image state
    setGalleryImages([])
    setProfilePhoto('')
    setServiceImageFile(null)
    setServiceImagePreview('')
  }

  const hasCreatedProfile = !!createdStylist
  const loginAlreadyGenerated = !!accountCredentials
  const disableGenerateLogin = !createdStylist || generatingAccount || loginAlreadyGenerated

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <DashboardHero
        eyebrow="Admin Dashboard"
        eyebrowClassName="text-red-600"
        title="System Administration"
        subtitle="Manage stylists, services, and platform operations"
        subtitleClassName="text-red-700/80"
        gradientFrom="from-red-50"
        gradientTo="to-pink-50"
        borderClassName="border-red-100"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 p-0 h-auto gap-4 sm:gap-6 flex-nowrap overflow-x-auto whitespace-nowrap justify-start rounded-none w-full -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
            {isEditMode ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditMode ? 'Edit Stylist' : 'Create Stylist'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="relative">
            <div
              className="flex gap-3 sm:gap-4 overflow-x-auto md:grid md:grid-cols-5 md:overflow-visible px-1 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory"
              ref={statsRef}
            >
            {/* Total Stylists */}
            <Card className="min-w-[220px] md:min-w-0 flex-shrink-0 snap-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-4">
                <CardTitle className="text-sm font-medium">Total Stylists</CardTitle>
                <User className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="text-lg sm:text-xl font-bold mb-1">{allStylists.length}</div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {allStylists.filter(s => s.user_id).length} with accounts
                </p>
              </CardContent>
            </Card>

            {/* Active Stylists */}
            <Card className="min-w-[220px] md:min-w-0 flex-shrink-0 snap-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-4">
                <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="text-lg sm:text-xl font-bold mb-1">{allStylists.filter(s => s.user_id).length}</div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  Stylists with active accounts
                </p>
              </CardContent>
            </Card>

            {/* No Account */}
            <Card className="min-w-[220px] md:min-w-0 flex-shrink-0 snap-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-4">
                <CardTitle className="text-sm font-medium">No Account</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="text-lg sm:text-xl font-bold mb-1">{allStylists.filter(s => !s.user_id).length}</div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  Stylists without accounts
                </p>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card className="min-w-[220px] md:min-w-0 flex-shrink-0 snap-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-4">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="text-lg sm:text-xl font-bold mb-1">{stylists.length}</div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  Awaiting verification
                </p>
              </CardContent>
            </Card>

            {/* New Stylists (30 days) */}
            <Card className="min-w-[220px] md:min-w-0 flex-shrink-0 snap-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-4">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <Calendar className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="text-lg sm:text-xl font-bold mb-1">
                  {allStylists.filter(s => {
                    if (!s.created_at) return false
                    const created = new Date(s.created_at).getTime()
                    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
                    return created >= thirtyDaysAgo
                  }).length}
                </div>
                <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                  Created in the last 30 days
                </p>
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Pending Verification Carousel */}
          <Card>
            <SectionHeader
              title="Pending Verification"
              description="Stylists awaiting approval"
              action={stylists.length > 0 ? (
                <SmallCtaButton
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => {
                    const pendingTab = document.querySelector('[value=\"pending\"]') as HTMLElement
                    if (pendingTab) pendingTab.click()
                  }}
                >
                  View All
                </SmallCtaButton>
              ) : undefined}
            />
            <CardContent className="pt-0">
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
                        <Card
                          className="group cursor-pointer hover:shadow-sm transition-shadow h-full"
                          onClick={() => openPreview(stylist.id)}
                        >
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
                                  className="bg-green-600 hover:bg-green-700 h-8 w-8 shadow-md rounded-md"
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
                                  className="bg-red-600 hover:bg-red-700 h-8 w-8 shadow-md rounded-md"
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
                                <h3 className="font-semibold text-lg text-gray-900 truncate">{stylist.business_name}</h3>
                              </div>

                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="text-sm truncate">{stylist.location}</span>
                              </div>

                              <div className="flex items-center text-gray-500 mb-3">
                                <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="text-xs">Submitted {formatSubmittedDate(stylist.submitted_at)}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                                  {stylist.primary_specialty || stylist.specialties?.[0] ? `${stylist.primary_specialty || stylist.specialties?.[0]}` : 'Hair'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openDetailsModal(stylist)
                                  }}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Details
                                </Button>
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
            <SectionHeader
              title="Stylists Awaiting Verification"
              description="Review and approve or reject stylist applications"
            />
            <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
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
                    <Card
                      key={stylist.id}
                      className="group cursor-pointer hover:shadow-sm transition-shadow h-full"
                      onClick={() => openPreview(stylist.id)}
                    >
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
                            <h3 className="font-semibold text-lg text-gray-900 truncate">{stylist.business_name}</h3>
                          </div>

                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-sm truncate">{stylist.location}</span>
                          </div>

                          <div className="flex items-center text-gray-500 mb-2">
                            <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs truncate">{stylist.contact_email}</span>
                          </div>

                          <div className="flex items-center text-gray-500 mb-3">
                            <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs">Submitted {formatSubmittedDate(stylist.submitted_at)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                              {stylist.primary_specialty || stylist.specialties?.[0] ? `${stylist.primary_specialty || stylist.specialties?.[0]}` : 'Hair'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDetailsModal(stylist)
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </Button>
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
            <SectionHeader
              title="Manage Stylists"
              description="View and manage all stylist profiles and their account status"
              action={
                <SmallCtaButton
                  variant="default"
                  onClick={() => window.location.href = '#create'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Stylist
                </SmallCtaButton>
              }
            />
            <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
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
                    <SmallCtaButton
                      onClick={() => window.location.href = '#create'}
                      variant="default"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Stylist
                    </SmallCtaButton>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Stylist</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Contact</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Location</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Account Status</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStylists.map((stylist) => {
                          const accountStatus = getAccountStatus(stylist)
                          
                          return (
                            <tr key={stylist.id} className="hover:bg-gray-50">
                              {/* Stylist Info */}
                              <td className="p-4">
                                <button
                                  className="flex items-center space-x-3 text-left w-full hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(`/stylist/${stylist.id}`, '_blank')}
                                >
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={stylist.logo_url || stylist.portfolio_images?.[0]} className="object-cover" />
                                    <AvatarFallback>
                                      {stylist.business_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {stylist.business_name || 'Unnamed Business'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {stylist.specialties?.[0] || 'No specialty'}
                                    </div>
                                  </div>
                                </button>
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
                                <Badge variant="secondary" className={`${accountStatus.color} whitespace-nowrap`}>
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
                                    <SmallCtaButton
                                      variant="default"
                                      className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-[12px] min-w-[140px] disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                                    </SmallCtaButton>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-3 text-sm min-w-[140px]"
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
                                    className="h-8 px-3 text-sm"
                                    onClick={() => loadStylistForEdit(stylist)}
                                    disabled={loadingEditData}
                                  >
                                    {loadingEditData ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <Edit className="w-3 h-3 mr-1" />
                                    )}
                                    Edit
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 text-sm"
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
          {/* Container styled like profile tab */}
          <Card className="shadow-sm">
            <SectionHeader
              title={isEditMode ? 'Edit Stylist Profile' : 'Create Stylist Profile'}
              description={isEditMode
                ? `Editing profile for ${formData.business_name || 'stylist'}. Make changes and save.`
                : 'Use the shared form layout to add a new stylist listing.'
              }
              action={isEditMode ? (
                <Button
                  variant="outline"
                  onClick={resetEditMode}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Edit
                </Button>
              ) : undefined}
            />
            <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <div className="max-w-3xl">
                <BusinessFormFields
                  formData={formData}
                  setFormData={setFormData}
                  additionalServices={additionalServices}
                  setAdditionalServices={setAdditionalServices}
                  logoImage={logoImage}
                  setLogoImage={setLogoImage}
                  galleryImages={galleryImages}
                  setGalleryImages={setGalleryImages}
                  services={formServices}
                  setServices={setFormServices}
                  isUploading={isUploading}
                  onUploadImages={adminUploadFiles}
                  showServices={true}
                />
              </div>

              {/* Account Access Section */}
              <Card className="mt-2 max-w-3xl">
                <SectionHeader
                  title={
                    <span className="flex items-center">
                      <Key className="w-4 h-4 mr-2 text-red-600" />
                      {isEditMode ? 'Save Changes' : 'Account Access'}
                    </span>
                  }
                  description={isEditMode
                    ? 'Save your changes to update this stylist profile'
                    : 'Create stylist profile and generate login credentials'
                  }
                />
                <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6 pt-0">
                  {/* Edit Mode - Save Button */}
                  {isEditMode ? (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-blue-900">Edit Mode Active</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Editing profile for <strong>{formData.business_name || 'stylist'}</strong>
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Editing
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          onClick={handleUpdateStylist}
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700 w-full"
                        >
                          {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" />Save Changes</>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={resetEditMode}
                          disabled={saving}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : !createdStylist ? (
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

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          onClick={handleSaveStylist}
                          disabled={saving}
                          className="bg-red-600 hover:bg-red-700 w-full"
                        >
                          {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" />Create Profile</>
                          )}
                        </Button>
                        <Button
                          type="button"
                          disabled
                          variant="outline"
                          className="w-full bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-100"
                        >
                          <User className="w-4 h-4 mr-2 text-gray-300" />
                          Generate Login Account
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-green-900 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Profile Created - Pending Verification
                          </h4>
                          <p className="text-sm text-green-700 mt-1">
                            Business: {createdStylist.business_name}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">
                          Pending
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          type="button"
                          disabled
                          variant="outline"
                          className="w-full bg-white text-green-800 border-green-200"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Profile Created
                        </Button>
                        <Button
                          onClick={handleGenerateAccount}
                          disabled={disableGenerateLogin}
                          className={`w-full ${disableGenerateLogin ? 'bg-gray-200 text-gray-500 hover:bg-gray-200' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                          {generatingAccount ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                          ) : (
                            <><Key className="w-4 h-4 mr-2" />Generate Login Account</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Login Account Status block removed per request */}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>

      {/* Stylist Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Application Details</span>
              <Badge className="bg-orange-600 hover:bg-orange-700 ml-2">Pending Verification</Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedStylist && (
            <div className="space-y-6">
              {/* Portfolio Images */}
              {selectedStylist.portfolio_images && selectedStylist.portfolio_images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Portfolio</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedStylist.portfolio_images.slice(0, 6).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                        <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Business Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedStylist.business_name}</p>
                        <p className="text-xs text-gray-500">{selectedStylist.business_type || 'Business'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">{selectedStylist.location}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {selectedStylist.year_started ? `Started in ${selectedStylist.year_started}` : 'Year not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">{selectedStylist.contact_email}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">{selectedStylist.phone || 'Not provided'}</p>
                    </div>
                    {selectedStylist.instagram_handle && (
                      <div className="flex items-start gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-700">@{selectedStylist.instagram_handle}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Specialties & Services</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStylist.primary_specialty && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                      {selectedStylist.primary_specialty} (Primary)
                    </Badge>
                  )}
                  {selectedStylist.specialties?.filter(s => s !== selectedStylist.primary_specialty).map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-gray-600">
                      {specialty}
                    </Badge>
                  ))}
                  {selectedStylist.additional_services?.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-gray-600">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3">
                {selectedStylist.accepts_same_day && (
                  <div className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span>Same-day booking</span>
                  </div>
                )}
                {selectedStylist.accepts_mobile && (
                  <div className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span>Mobile services</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedStylist.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedStylist.bio}</p>
                </div>
              )}

              {/* Submission Info */}
              <div className="border-t pt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Submitted {selectedStylist.submitted_at ? format(new Date(selectedStylist.submitted_at), 'PPP \'at\' p') : 'Unknown'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={approvingId === selectedStylist.id}
                  onClick={() => handleApprove(selectedStylist.id)}
                >
                  {approvingId === selectedStylist.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Listing
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={rejectingId === selectedStylist.id}
                  onClick={() => handleReject(selectedStylist.id)}
                >
                  {rejectingId === selectedStylist.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Listing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard
