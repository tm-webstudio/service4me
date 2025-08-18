"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Upload, ExternalLink, Settings, MessageSquare, Plus, Edit, Trash2, Scissors, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useStylistProfileEditor } from "@/hooks/use-stylist-profile-editor"
import { useAuth } from "@/hooks/use-auth"

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
  const { profile, loading, saving, error, updateProfile } = useStylistProfileEditor()
  const [isEditing, setIsEditing] = useState(false)
  
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
            {/* Current Gallery */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Current Gallery</h4>
              <div className="grid grid-cols-3 gap-3">
                {/* Placeholder images - will be replaced with real images later */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={`/placeholder.svg?height=200&width=200&text=Image+${index + 1}`}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover bg-gray-200"
                    />
                    {/* Delete button on hover */}
                    <button 
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                      onClick={() => {
                        // Placeholder function - will be implemented when connected to database
                        console.log(`Delete image ${index + 1}`);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Images */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Add New Images</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h5 className="text-sm font-medium text-gray-900 mb-1">Upload Gallery Images</h5>
                <p className="text-xs text-gray-500 mb-3">Drag and drop your images here, or click to browse</p>
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  Choose Files
                </Button>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 5MB per image. Up to 20 images.</p>
              </div>
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