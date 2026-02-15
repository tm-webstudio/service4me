"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SpecialistBadge } from "@/components/ui/specialist-badge"
import { MapPin, Heart, Loader2, TrendingUp, Star } from "lucide-react"
import { StarDisplay } from "@/components/ui/star-rating"
import { useRouter } from "next/navigation"
import { useStylists, type StylistProfile } from "@/hooks/use-stylists"
import { useSavedStylistIds } from "@/hooks/use-saved-stylists"
import { postcodeToAreaName, postcodeToAreaNameWithCode } from "@/lib/postcode-utils"
import { StylistCardSkeleton } from "@/components/ui/skeletons"
import { EmptyState } from "@/components/ui/empty-state"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { useState } from "react"
import { SERVICE_TYPES, getServiceTypeLabel } from "@/lib/service-types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SortOption = "rating" | "featured"

interface StylistGridProps {
  category?: string
  location?: string
  serviceType?: string
}

export function StylistGrid({ category, location, serviceType }: StylistGridProps = {}) {
  const router = useRouter()
  const { stylists, loading, error } = useStylists()
  const { savedIds, toggleSave, savingId, isAuthenticated } = useSavedStylistIds()
  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>(serviceType || "all")

  // Filter stylists based on category, location, and service type
  const filteredStylists = stylists.filter(stylist => {
    let matchesCategory = true
    let matchesLocation = true
    let matchesServiceType = true

    if (category) {
      matchesCategory = stylist.specialties.includes(category)
    }

    if (location) {
      matchesLocation = stylist.location?.toLowerCase().includes(location.toLowerCase()) || false
    }

    if (serviceTypeFilter && serviceTypeFilter !== "all") {
      matchesServiceType = (stylist.service_type || 'hairstylist') === serviceTypeFilter
    }

    return matchesCategory && matchesLocation && matchesServiceType
  })

  // Sort filtered stylists based on selected option
  const sortedStylists = [...filteredStylists].sort((a, b) => {
    if (sortBy === "rating") {
      // Sort by average rating (highest first), then by review count
      if (b.average_rating !== a.average_rating) {
        return (b.average_rating || 0) - (a.average_rating || 0)
      }
      return (b.review_count || 0) - (a.review_count || 0)
    }
    // Default: featured (verified first, then by creation date)
    if (a.is_verified !== b.is_verified) {
      return a.is_verified ? -1 : 1
    }
    return 0
  })

  // Helper function to format specialties for display
  const getExpertiseDisplay = (stylist: StylistProfile) => {
    if (stylist.specialties && stylist.specialties.length > 0) {
      return `${stylist.specialties[0]} Specialist`
    }
    return getServiceTypeLabel(stylist.service_type || 'hairstylist')
  }

  // Helper function to get stylist image (portfolio or placeholder)
  const getStylistImage = (stylist: StylistProfile) => {
    // If portfolio images exist, use the first one
    if (stylist.portfolio_images && stylist.portfolio_images.length > 0) {
      return stylist.portfolio_images[0]
    }
    // Otherwise use placeholder with business name
    const encodedName = encodeURIComponent(stylist.business_name || "Hair Studio")
    return `/placeholder.svg?height=300&width=300&text=${encodedName}`
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6 md:pt-0 md:pb-8">
      {/* Browse Professionals Header with Sort and Filter */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200 py-2 mb-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-normal text-gray-900">Sort by:</span>
            <button
              onClick={() => setSortBy("rating")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                sortBy === "rating"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Rating
            </button>
            <button
              onClick={() => setSortBy("featured")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                sortBy === "featured"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Featured
            </button>
          </div>
        </div>
      </div>

      {/* Loading State with Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <StylistCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading stylists: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && sortedStylists.length === 0 && (
        <EmptyState
          icon={<Heart className="h-8 w-8 text-gray-400" />}
          title={
            category || location || (serviceTypeFilter && serviceTypeFilter !== 'all')
              ? `No professionals found${category ? ` for ${category}` : ''}${serviceTypeFilter && serviceTypeFilter !== 'all' ? ` in ${getServiceTypeLabel(serviceTypeFilter)}` : ''}${location ? ` in ${location}` : ''}.`
              : "No professionals available yet."
          }
          description={
            category || location || (serviceTypeFilter && serviceTypeFilter !== 'all')
              ? "Try browsing all professionals or a different category."
              : "Tap browse to discover professionals you might like."
          }
          className="py-10 space-y-1"
          titleClassName="text-base font-medium text-gray-900"
          descriptionClassName="text-sm text-gray-500"
          action={
            <SmallCtaButton
              className="bg-red-600 text-white border-red-600 hover:bg-red-700"
              onClick={() => router.push("/browse")}
            >
              Browse Stylists
            </SmallCtaButton>
          }
        />
      )}

      {/* Stylist Grid - Real Data */}
      {!loading && !error && sortedStylists.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {sortedStylists.map((stylist) => {
          const expertise = getExpertiseDisplay(stylist)
          const businessName = stylist.business_name || "Hair Studio"
          const location = stylist.location ? postcodeToAreaNameWithCode(stylist.location) : "London, UK"
          const rating = stylist.average_rating || 0
          const reviewCount = stylist.review_count || 0
          
          return (
            <Card 
              key={stylist.id}
              className="group cursor-pointer hover:shadow-sm transition-all duration-300 border h-full"
              onClick={() => router.push(`/stylist/${stylist.id}`)}
            >
              <CardContent className="p-0 h-full">
                <div className="relative aspect-[4/3]">
                  <img
                    src={getStylistImage(stylist)}
                    alt={businessName}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-9 md:h-9 bg-white/80 hover:bg-white"
                    disabled={savingId === stylist.id || !isAuthenticated}
                    title={!isAuthenticated ? "Sign in to save stylists" : savedIds.includes(stylist.id) ? "Remove from saved" : "Save stylist"}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleSave(stylist.id)
                    }}
                  >
                    {savingId === stylist.id ? (
                      <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin text-gray-600" />
                    ) : (
                      <Heart
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                          savedIds.includes(stylist.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`}
                      />
                    )}
                  </Button>
                </div>

                <div className="p-2 md:p-4">
                  {/* Mobile Layout - Title first, then stars below */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 gap-1 md:gap-2 min-w-0">
                    <h3 className="font-medium text-base text-gray-900 leading-tight truncate">{businessName}</h3>
                    <StarDisplay rating={rating} totalReviews={reviewCount} size="sm" className="flex-shrink-0" />
                  </div>

                  <div className="flex items-center text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{location}</span>
                  </div>

                  <div>
                    <SpecialistBadge
                      specialty={expertise}
                      className="whitespace-nowrap"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}
    </div>
  )
}
