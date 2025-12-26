"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useStylist } from "@/hooks/use-stylist"
import { useStylistServices } from "@/hooks/use-stylist-services"
import { useSavedStylists } from "@/hooks/use-saved-stylists"
import { postcodeToAreaName, postcodeToAreaNameWithCode } from "@/lib/postcode-utils"
import { StylistLocationMap, MapStylesImport } from "@/components/stylist-location-map"
import {
  StylistProfileSkeleton,
  ServicesSkeleton,
  LocationCardSkeleton,
  ContactCardSkeleton,
  ReviewsSkeleton
} from "@/components/ui/skeletons"
import { StarDisplay } from "@/components/ui/star-rating"
import { ReviewForm } from "@/components/review-form"
import { ReviewsDisplay } from "@/components/reviews-display"
import { useAuth } from "@/lib/auth-v2"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SpecialistBadge } from "@/components/ui/specialist-badge"
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Heart,
  Share,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Instagram,
  Briefcase,
  Car,
} from "lucide-react"

// TikTok icon component since it's not in lucide-react
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

// Default fallback data for missing information
const defaultHours = {
  monday: "9:00 AM - 6:00 PM",
  tuesday: "9:00 AM - 6:00 PM", 
  wednesday: "9:00 AM - 6:00 PM",
  thursday: "9:00 AM - 8:00 PM",
  friday: "9:00 AM - 8:00 PM",
  saturday: "8:00 AM - 5:00 PM",
  sunday: "Closed",
}


interface StylistProfileProps {
  stylistId: string
}

export function StylistProfile({ stylistId }: StylistProfileProps) {
  const { user } = useAuth()
  const { stylist, loading, error, refetch: refetchStylist } = useStylist(stylistId)
  const { services, loading: servicesLoading, error: servicesError, formatDuration } = useStylistServices(stylist?.id)
  const { isSaved: isFavorite, toggleSave, loading: savingFavorite, isAuthenticated } = useSavedStylists(stylist?.id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<{id: string; rating: number; comment: string} | null>(null)
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0)
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false)

  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayData.portfolio.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayData.portfolio.length) % displayData.portfolio.length)
  }

  const openGallery = (index: number) => {
    setSelectedImage(index)
    setIsGalleryOpen(true)
  }

  const handleLeaveReviewClick = () => {
    if (!user) {
      setIsAuthPromptOpen(true)
      return
    }
    setShowReviewForm(true)
  }

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
        <MapStylesImport />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-5">
            <StylistProfileSkeleton />
            <ServicesSkeleton />
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <LocationCardSkeleton />
            <ContactCardSkeleton />
          </div>
        </div>

        {/* Reviews Skeleton */}
        <ReviewsSkeleton />
      </div>
    )
  }

  // Error state
  if (error && !stylist) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">Error loading stylist profile: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // No stylist found
  if (!stylist) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Stylist not found.</p>
          <p className="text-sm text-gray-500">The stylist profile you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  // Helper functions for real data with fallbacks
  const getBusinessName = () => stylist.business_name || "Hair Studio"
  const getBio = () => stylist.bio || "Professional hairstylist dedicated to helping you look and feel your best."
  const getLocation = () => {
    if (stylist.location) {
      // Convert postcode to area name
      return postcodeToAreaName(stylist.location)
    }
    return "London, UK"
  }
  const getLocationWithCode = () => {
    if (stylist.location) {
      // Convert postcode to area name with outward code for location section only
      return postcodeToAreaNameWithCode(stylist.location)
    }
    return "London, UK"
  }
  const getExpertise = () => {
    if (stylist.specialties && stylist.specialties.length > 0) {
      return `${stylist.specialties[0]} Specialist`
    }
    return "Hair Specialist"
  }
  const getExperience = () => {
    // Calculate years from year_started if available
    if (stylist.year_started) {
      const currentYear = new Date().getFullYear()
      const years = currentYear - stylist.year_started
      return years > 0 ? `${years} years` : "Less than a year"
    }
    // Fallback to years_experience field
    const years = stylist.years_experience || 0
    return years > 0 ? `${years} years` : "Experienced"
  }
  const getRating = () => stylist.average_rating || 0
  const getReviewCount = () => stylist.review_count || 0
  const getHourlyRate = () => stylist.hourly_rate || 50

  // Get real services from database with fallbacks
  const getServices = () => {
    // If we have real services from database, use them
    if (services && services.length > 0) {
      return services.map(service => ({
        name: service.name,
        price: service.price, // Already converted to pounds in the hook
        duration: formatDuration(service.duration),
        image: service.image_url || "/placeholder.svg?height=200&width=300",
        id: service.id
      }))
    }
    
    // Fallback to placeholder services based on specialties if no real services
    if (stylist.specialties && stylist.specialties.length > 0) {
      return stylist.specialties.map((specialty, index) => ({
        name: specialty,
        price: getHourlyRate() + (index * 20),
        duration: "2-3 hours",
        image: "/placeholder.svg?height=200&width=300",
        id: `fallback-${index}`
      }))
    }

    // Final fallback
    return [
      {
        name: "Hair Styling",
        price: getHourlyRate(),
        duration: "1-2 hours",
        image: "/placeholder.svg?height=200&width=300",
        id: 'fallback-1'
      },
      {
        name: "Hair Care",
        price: getHourlyRate() + 20,
        duration: "2-3 hours",
        image: "/placeholder.svg?height=200&width=300",
        id: 'fallback-2'
      }
    ]
  }

  // Portfolio images from database
  const getPortfolio = () => {
    const portfolioImages = stylist.portfolio_images || []
    
    // If there are real portfolio images, use them
    if (portfolioImages.length > 0) {
      return portfolioImages
    }
    
    // Fallback to placeholder images if no portfolio images
    const businessName = getBusinessName()
    return Array(8).fill(0).map((_, i) => 
      `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(businessName)}`
    )
  }

  // Use real data with fallbacks
  const displayData = {
    businessName: getBusinessName(),
    image: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(getBusinessName())}`,
    rating: getRating(),
    reviewCount: getReviewCount(),
    location: getLocation(),
    expertise: getExpertise(),
    experience: getExperience(),
    bio: getBio(),
    contact: {
      phone: "020 7946 0892",
      email: stylist.email || "info@salon.co.uk",
      instagram: "@salon_instagram",
      tiktok: "@salon_tiktok",
    },
    services: getServices(),
    portfolio: getPortfolio(),
    hours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 8:00 PM",
      friday: "9:00 AM - 8:00 PM",
      saturday: "8:00 AM - 5:00 PM",
      sunday: "Closed",
    },
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
      <MapStylesImport />

      {/* Inactive Profile Notice */}
      {!stylist.is_active && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            This stylist profile is currently inactive and may not appear in search results.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Gallery */}
          <div className="relative">
            <Badge className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 z-10">
              {stylist.is_verified ? "Verified Stylist" : "Featured Stylist"}
            </Badge>

            {/* Desktop Gallery Grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2 row-span-2 aspect-square">
                  <img
                    src={displayData.portfolio[0] || "/placeholder.svg"}
                    alt="Portfolio 1"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(0)}
                  />
                </div>
                <div className="col-span-1 aspect-square">
                  <img
                    src={displayData.portfolio[1] || "/placeholder.svg"}
                    alt="Portfolio 2"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(1)}
                  />
                </div>
                <div className="col-span-1 aspect-square">
                  <img
                    src={displayData.portfolio[2] || "/placeholder.svg"}
                    alt="Portfolio 3"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(2)}
                  />
                </div>
                <div className="col-span-1 aspect-square">
                  <img
                    src={displayData.portfolio[3] || "/placeholder.svg"}
                    alt="Portfolio 4"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(3)}
                  />
                </div>
                <div className="col-span-1 aspect-square relative">
                  <img
                    src={displayData.portfolio[4] || "/placeholder.svg"}
                    alt="Portfolio 5"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(4)}
                  />
                  <Button
                    variant="secondary"
                    className="absolute bottom-4 right-4 bg-white hover:bg-gray-100"
                    onClick={() => openGallery(0)}
                  >
                    Show all photos
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Slideshow */}
            <div className="md:hidden relative">
              <div
                className="relative aspect-[4/3] rounded-lg overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={displayData.portfolio[currentSlide] || "/placeholder.svg"}
                  alt={`Portfolio ${currentSlide + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {displayData.portfolio.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div>
            {/* Rating, business name and action buttons - all in one container */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                {/* Mobile: Rating above business name */}
                <div className="flex items-center mb-1 md:hidden">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700 ml-1 text-sm">
                    {stylist.average_rating > 0 ? stylist.average_rating.toFixed(1) : "New"}
                  </span>
                  <span className="text-gray-500 ml-1 text-sm">
                    ({stylist.review_count || 0})
                  </span>
                </div>

                {/* Desktop: Business name and rating side by side */}
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-medium text-gray-900">{displayData.businessName}</h1>

                  {/* Desktop: Rating to the right of business name */}
                  <div className="hidden md:flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-700 ml-1 text-sm">
                      {stylist.average_rating > 0 ? stylist.average_rating.toFixed(1) : "New"}
                    </span>
                    <span className="text-gray-500 ml-1 text-sm">
                      ({stylist.review_count || 0})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0 ml-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSave}
                  disabled={savingFavorite || !isAuthenticated}
                  title={!isAuthenticated ? "Sign in to save stylists" : isFavorite ? "Remove from saved" : "Save stylist"}
                >
                  {savingFavorite ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Specialist badge and experience */}
            <div className="flex flex-row items-center gap-2 sm:gap-3 mb-4">
              <SpecialistBadge specialty={displayData.expertise} />
              {stylist.year_started && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Award className="w-4 h-4 mr-1" />
                    <span>{displayData.experience} experience</span>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Layout - Location and features grid */}
            <div className="flex flex-col sm:hidden mb-4">

              {/* 2x2 Grid for location and features */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{displayData.location}</span>
                </div>
                {stylist.business_type && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Briefcase className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="capitalize truncate">{stylist.business_type.replace(/-/g, ' ')}</span>
                  </div>
                )}
                {stylist.accepts_mobile && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Car className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Mobile Appointments</span>
                  </div>
                )}
                {stylist.accepts_same_day && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Same Day Appointments</span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout - Location and features row with bullets */}
            <div className="hidden sm:flex items-center text-gray-600 mb-4 text-sm flex-wrap gap-y-1">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{displayData.location}</span>
              </div>
              {stylist.business_type && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span className="capitalize">{stylist.business_type.replace(/-/g, ' ')}</span>
                  </div>
                </>
              )}
              {stylist.accepts_mobile && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-1" />
                    <span>Mobile Appointments</span>
                  </div>
                </>
              )}
              {stylist.accepts_same_day && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Same Day Appointments</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-gray-700 leading-relaxed mb-6 text-sm max-w-2xl">{displayData.bio}</p>

            {/* Additional services badges */}
            {stylist.additional_services && stylist.additional_services.length > 0 && (
              <div className="flex flex-col gap-3 mb-6">
                <h3 className="text-xs font-normal text-gray-600">Also Offers...</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {stylist.additional_services.map((service, index) => (
                    <div key={index} className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-2.5 py-0.5 text-[12px]">
                      {service}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Now Button and Instagram */}
            <div className="flex items-center space-x-4">
              {stylist.booking_link ? (
                <Button
                  className="bg-red-600 hover:bg-red-700 px-12 py-6 w-full sm:w-2/5"
                  size="lg"
                  onClick={() => {
                    const url = stylist.booking_link?.startsWith('http')
                      ? stylist.booking_link
                      : `https://${stylist.booking_link}`;
                    window.location.href = url;
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
              ) : (
                <Button 
                  className="bg-gray-400 cursor-not-allowed px-12 py-6 w-full sm:w-2/5" 
                  size="lg"
                  disabled
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Booking Unavailable
                </Button>
              )}
              {stylist.instagram_handle && (
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 bg-transparent"
                  onClick={() => window.open(`https://instagram.com/${stylist.instagram_handle?.replace('@', '')}`, '_blank', 'noopener,noreferrer')}
                >
                  <Instagram className="w-5 h-5 text-gray-600" />
                </Button>
              )}
            </div>
          </div>

          {/* Services & Pricing */}
          <div className="space-y-4 pt-6 w-full sm:w-1/2">
            <h2 className="text-base font-medium text-gray-900">Services & Pricing</h2>
            {servicesLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-2">
                      <div className="flex items-stretch space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />
                        <div className="flex-1 flex flex-col justify-between min-h-[64px]">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                        </div>
                        <div className="self-stretch flex items-end">
                          <div className="h-4 bg-gray-200 rounded w-10 animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : servicesError ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">Unable to load services</p>
                <p className="text-sm text-gray-400">Using placeholder services</p>
              </div>
            ) : displayData.services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No services available</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {displayData.services.map((service, index) => (
                  <Card key={service.id || index}>
                    <CardContent className="p-2.5">
                      <div className="flex items-stretch space-x-3">
                        <img
                          src={service.image || "/placeholder.svg"}
                          alt={service.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder.svg?height=200&width=200&text=Service'
                          }}
                        />
                        <div className="flex-1 flex flex-col justify-between min-h-[64px]">
                          <h3 className="font-medium text-sm">{service.name}</h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{service.duration}</span>
                          </div>
                        </div>
                        <div className="self-stretch flex items-end text-right">
                          <div className="text-sm font-medium text-gray-700">£{service.price}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="pt-8 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-900">Reviews</h2>
              {(!user || user?.role === 'client') && !showReviewForm && !editingReview && stylist.review_count > 0 && (
                <SmallCtaButton onClick={handleLeaveReviewClick} variant="outline">
                  Leave a Review
                </SmallCtaButton>
              )}
            </div>

            {/* Review Form */}
            {(showReviewForm || editingReview) && (
              <ReviewForm
                stylistId={stylistId}
                existingReview={editingReview || undefined}
                onSuccess={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                  setReviewsRefreshTrigger(prev => prev + 1)
                  refetchStylist() // Refresh stylist data to get updated rating
                }}
                onCancel={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                }}
              />
            )}

            {/* Reviews Display */}
            <ReviewsDisplay
              stylistId={stylistId}
              onLeaveReview={handleLeaveReviewClick}
              onEditReview={(review) => {
                setEditingReview({
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment || ""
                })
                setShowReviewForm(false)
              }}
              refreshTrigger={reviewsRefreshTrigger}
              onReviewDeleted={() => {
                refetchStylist() // Refresh stylist data to get updated rating
              }}
            />
          </div>
        </div>

        {/* Sidebar - Sticky on desktop */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Location */}
          <Card>
            <CardContent className="px-3 py-4 sm:p-5">
              {/* Profile Card */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={stylist.logo_url || stylist.portfolio_images?.[0]} className="object-cover" />
                  <AvatarFallback className="bg-red-600/70 text-white font-semibold text-lg">
                    {displayData.businessName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-base">{displayData.businessName}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span>{getLocationWithCode()}</span>
                  </div>
                </div>
              </div>

              <StylistLocationMap
                postcode={stylist.location || ''}
                businessName={displayData.businessName}
                className="h-48"
              />
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader className="p-4 sm:p-5 pb-4">
              <CardTitle className="text-base font-medium">Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
              {stylist.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-600" />
                  <a href={`tel:${stylist.phone}`} className="text-gray-700 hover:text-gray-900 text-sm">
                    {stylist.phone}
                  </a>
                </div>
              )}
              {stylist.contact_email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-gray-600" />
                  <a href={`mailto:${stylist.contact_email}`} className="text-gray-700 hover:text-gray-900 text-sm">
                    {stylist.contact_email}
                  </a>
                </div>
              )}
              {(stylist.instagram_handle || stylist.tiktok_handle) && (
                <div className="border-t pt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {stylist.instagram_handle && (
                      <div className="flex items-center">
                        <Instagram className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                        <a
                          href={`https://instagram.com/${stylist.instagram_handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-gray-900 text-sm"
                        >
                          {stylist.instagram_handle.replace('@', '')}
                        </a>
                      </div>
                    )}
                    {stylist.tiktok_handle && (
                      <div className="flex items-center">
                        <TikTokIcon className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                        <a
                          href={`https://tiktok.com/@${stylist.tiktok_handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-gray-900 text-sm"
                        >
                          {stylist.tiktok_handle.replace('@', '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!stylist.phone && !stylist.contact_email && !stylist.instagram_handle && !stylist.tiktok_handle && (
                <p className="text-gray-500 text-sm">No contact information available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gallery Modal */}
      <Dialog open={isAuthPromptOpen} onOpenChange={setIsAuthPromptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Leave a review</DialogTitle>
            <DialogDescription>
              Create an account or log in to leave a review for this stylist.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 pt-2">
            <SmallCtaButton asChild variant="outline">
              <Link href="/login">Log in</Link>
            </SmallCtaButton>
            <SmallCtaButton
              asChild
              className="bg-red-600 text-white border-red-600 hover:bg-red-700"
            >
              <Link href="/signup">Create account</Link>
            </SmallCtaButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogTitle className="sr-only">Portfolio Gallery</DialogTitle>
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setIsGalleryOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            <img
              src={displayData.portfolio[selectedImage] || "/placeholder.svg"}
              alt={`Portfolio ${selectedImage + 1}`}
              className="w-full h-full object-contain"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
              onClick={() =>
                setSelectedImage((prev) => (prev - 1 + displayData.portfolio.length) % displayData.portfolio.length)
              }
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setSelectedImage((prev) => (prev + 1) % displayData.portfolio.length)}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {displayData.portfolio.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${index === selectedImage ? "bg-white" : "bg-white/50"}`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
