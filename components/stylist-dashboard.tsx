"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Star, Upload, ExternalLink, Settings, MessageSquare, Plus, Edit, Trash2, Scissors, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useStylistProfileEditor } from "@/hooks/use-stylist-profile-editor"
import { useAuth } from "@/hooks/use-auth"

export function StylistDashboard() {
  const { user } = useAuth()
  const { profile, loading, saving, error, updateProfile } = useStylistProfileEditor()
  const [isEditing, setIsEditing] = useState(false)
  
  // Form state for editing
  const [formData, setFormData] = useState({
    business_name: '',
    bio: '',
    location: '',
    specialties: [] as string[],
    years_experience: 0,
    hourly_rate: 0
  })
  
  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        specialties: profile.specialties || [],
        years_experience: profile.years_experience || 0,
        hourly_rate: profile.hourly_rate || 0
      })
    }
  }, [profile])
  
  const handleSave = async () => {
    if (!profile) return
    
    try {
      await updateProfile(formData)
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
        specialties: profile.specialties || [],
        years_experience: profile.years_experience || 0,
        hourly_rate: profile.hourly_rate || 0
      })
    }
    setIsEditing(false)
  }
  
  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
    }
  }
  
  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
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
                {getSpecialties().slice(0, 2).map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="bg-blue-100 text-blue-800">
                    {specialty} Specialist
                  </Badge>
                ))}
                {getSpecialties().length > 2 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    +{getSpecialties().length - 2} more
                  </Badge>
                )}
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
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`/placeholder.svg?height=100&width=100&text=${encodeURIComponent(getBusinessName())}`} />
                  <AvatarFallback>{getBusinessName().split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{getBusinessName()}</h3>
                  <p className="text-gray-600">{getLocation()}</p>
                  <p className="text-sm text-gray-500">Professional Stylist</p>
                </div>
              </div>
            </div>

            {/* Business Name */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Business Name</h4>
              {isEditing ? (
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="Your business name"
                />
              ) : (
                <p className="text-gray-700">{getBusinessName()}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
              {isEditing ? (
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Your location"
                />
              ) : (
                <p className="text-gray-700">{getLocation()}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell clients about yourself and your services..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">{getBio()}</p>
              )}
            </div>

            {/* Specialties */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                        {specialty}
                        <button 
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add specialty (e.g., Braids, Locs, etc.)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addSpecialty(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        if (input.value) {
                          addSpecialty(input.value)
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getSpecialties().length > 0 ? (
                    getSpecialties().map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No specialties added yet. Click "Edit Profile" to add some!</p>
                  )}
                </div>
              )}
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