"use client"

import type React from "react"

import { useState } from "react"
import { useStylist } from "@/hooks/use-stylist"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
} from "lucide-react"

// TikTok icon component since it's not in lucide-react
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const stylistData = {
  businessName: "RS Hair",
  image: "/placeholder.svg?height=400&width=400",
  rating: 4.9,
  reviewCount: 127,
  location: "Barking, London",
  expertise: "Braids Specialist",
  experience: "8 years",
  bio: "Passionate hair salon specializing in natural hair care and protective styling. We believe every client deserves to feel beautiful and confident. With 8 years of experience, we've helped hundreds of clients achieve their hair goals while maintaining healthy hair practices.",
  contact: {
    phone: "020 7946 0892",
    email: "info@rshair.co.uk",
    instagram: "@rs_hair_london",
    tiktok: "@rshairlondon",
  },
  services: [
    {
      name: "Box Braids",
      price: 120,
      duration: "3-4 hours",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Knotless Braids",
      price: 150,
      duration: "4-5 hours",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Faux Locs",
      price: 180,
      duration: "5-6 hours",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Twist Out",
      price: 85,
      duration: "2 hours",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Wash & Style",
      price: 65,
      duration: "1.5 hours",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Deep Conditioning",
      price: 45,
      duration: "1 hour",
      image: "/placeholder.svg?height=200&width=300",
    },
  ],
  portfolio: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
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

const reviews = [
  {
    id: 1,
    name: "Jasmine K.",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "RS Hair did an amazing job on my knotless braids! They look so natural and the team was very gentle with my hair. Definitely booking again!",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Tiffany M.",
    rating: 5,
    date: "1 month ago",
    comment:
      "Best braider in London! RS Hair is professional, skilled, and their salon is so clean and welcoming. My braids lasted 8 weeks and still looked fresh.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Keisha R.",
    rating: 5,
    date: "1 month ago",
    comment:
      "I've been going to RS Hair for 2 years now and they never disappoint. They really care about hair health and always give great advice.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

interface StylistProfileProps {
  stylistId: string
}

export function StylistProfile({ stylistId }: StylistProfileProps) {
  const { stylist, loading, error } = useStylist(stylistId)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

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

  // Loading state
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Loading stylist profile...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !stylist) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
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
  const getLocation = () => stylist.location || "London, UK"
  const getExpertise = () => {
    if (stylist.specialties && stylist.specialties.length > 0) {
      return `${stylist.specialties[0]} Specialist`
    }
    return "Hair Specialist"
  }
  const getExperience = () => {
    const years = stylist.years_experience || 0
    return years > 0 ? `${years} years` : "Experienced"
  }
  const getRating = () => stylist.rating || 0
  const getReviewCount = () => stylist.total_reviews || 0
  const getHourlyRate = () => stylist.hourly_rate || 50

  // Placeholder services based on specialties
  const getServices = () => {
    if (stylist.specialties && stylist.specialties.length > 0) {
      return stylist.specialties.map((specialty, index) => ({
        name: specialty,
        price: getHourlyRate() + (index * 20),
        duration: "2-3 hours",
        image: "/placeholder.svg?height=200&width=300",
      }))
    }
    return [
      {
        name: "Hair Styling",
        price: getHourlyRate(),
        duration: "1-2 hours",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        name: "Hair Care",
        price: getHourlyRate() + 20,
        duration: "2-3 hours",
        image: "/placeholder.svg?height=200&width=300",
      }
    ]
  }

  // Placeholder portfolio images
  const getPortfolio = () => {
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
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <div className="col-span-2 row-span-2">
                  <img
                    src={displayData.portfolio[0] || "/placeholder.svg"}
                    alt="Portfolio 1"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(0)}
                  />
                </div>
                <div className="col-span-1">
                  <img
                    src={displayData.portfolio[1] || "/placeholder.svg"}
                    alt="Portfolio 2"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(1)}
                  />
                </div>
                <div className="col-span-1">
                  <img
                    src={displayData.portfolio[2] || "/placeholder.svg"}
                    alt="Portfolio 3"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(2)}
                  />
                </div>
                <div className="col-span-1">
                  <img
                    src={displayData.portfolio[3] || "/placeholder.svg"}
                    alt="Portfolio 4"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(3)}
                  />
                </div>
                <div className="col-span-1 relative">
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
                className="relative h-64 rounded-lg overflow-hidden"
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
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayData.businessName}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-600 mb-2 text-[15px]">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{displayData.rating > 0 ? displayData.rating.toFixed(1) : "New"}</span>
                    <span className="ml-1">({displayData.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{displayData.location}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 mb-2 text-[15px]">
                  <Award className="w-4 h-4 mr-1" />
                  <span>{displayData.experience} experience</span>
                </div>
                <div className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-[14px]">
                  {displayData.expertise}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-gray-700 leading-relaxed mb-6 text-[15px]">{displayData.bio}</p>

            {/* Book Now Button and Instagram */}
            <div className="flex items-center space-x-4">
              <Button className="bg-red-600 hover:bg-red-700 px-12 py-6 w-full sm:w-2/5" size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 bg-transparent"
              >
                <Instagram className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Services & Pricing */}
          <div className="space-y-6 max-w-lg">
            <h2 className="text-xl font-bold text-gray-900">Services & Pricing</h2>
            <div className="grid gap-4">
              {displayData.services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={service.image || "/placeholder.svg"}
                        alt={service.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{service.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-gray-700">£{service.price}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-3">
                <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-sm">{displayData.location}</span>
              </div>
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <span className="text-gray-500">Map View</span>
              </div>
            </CardContent>
          </Card>

          {/* Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(displayData.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{day}</span>
                    <span className="text-gray-600">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-gray-600" />
                <span>{displayData.contact.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-gray-600" />
                <span>{displayData.contact.email}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-gray-600 hover:text-gray-800">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-800">
                    <TikTokIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews - Full Width */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
          <Button className="bg-red-600 hover:bg-red-700">Leave a Review</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={review.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{review.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{review.name}</h4>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
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
