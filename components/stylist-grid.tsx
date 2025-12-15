"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SpecialistBadge } from "@/components/ui/specialist-badge"
import { MapPin, Heart, Loader2 } from "lucide-react"
import { StarDisplay } from "@/components/ui/star-rating"
import { useRouter } from "next/navigation"
import { useStylists, type StylistProfile } from "@/hooks/use-stylists"
import { useSavedStylistIds } from "@/hooks/use-saved-stylists"
import { postcodeToAreaName } from "@/lib/postcode-utils"
import { StylistCardSkeleton } from "@/components/ui/skeletons"

interface StylistGridProps {
  category?: string
  location?: string
}

export function StylistGrid({ category, location }: StylistGridProps = {}) {
  const router = useRouter()
  const { stylists, loading, error } = useStylists()
  const { savedIds, toggleSave, savingId, isAuthenticated } = useSavedStylistIds()

  // Filter stylists based on category and location
  const filteredStylists = stylists.filter(stylist => {
    let matchesCategory = true
    let matchesLocation = true

    if (category) {
      matchesCategory = stylist.specialties.includes(category)
    }

    if (location) {
      // Check if stylist location contains the filter location
      matchesLocation = stylist.location?.toLowerCase().includes(location.toLowerCase()) || false
    }

    return matchesCategory && matchesLocation
  })

  // Helper function to format specialties for display
  const getExpertiseDisplay = (specialties: string[]) => {
    if (!specialties || specialties.length === 0) {
      return "Hair Specialist"
    }
    return `${specialties[0]} Specialist`
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
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Browse Stylists Header with Sort */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {category ? `${category} Stylists` : 'Browse Stylists'} 
          {filteredStylists.length > 0 && ` (${filteredStylists.length})`}
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 hidden md:inline">Sort by:</span>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white">
            <option>Recommended</option>
            <option>Distance</option>
            <option>Rating</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Loading State with Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
      {!loading && !error && filteredStylists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {category || location 
              ? `No stylists found for ${category || location}.` 
              : 'No stylists found.'
            }
          </p>
          <p className="text-sm text-gray-500">
            {category || location 
              ? 'Try browsing all stylists or a different category.' 
              : 'Check back soon as new stylists join regularly!'
            }
          </p>
        </div>
      )}

      {/* Stylist Grid - Real Data */}
      {!loading && !error && filteredStylists.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredStylists.map((stylist) => {
          const expertise = getExpertiseDisplay(stylist.specialties)
          const businessName = stylist.business_name || "Hair Studio"
          const location = stylist.location ? postcodeToAreaName(stylist.location) : "London, UK"
          const rating = stylist.average_rating || 0
          const reviewCount = stylist.review_count || 0
          
          return (
            <Card 
              key={stylist.id}
              className="group cursor-pointer hover:shadow-sm transition-all duration-300 border h-full"
              onClick={() => router.push(`/stylist/${stylist.id}`)}
            >
              <CardContent className="p-0 h-full">
                <div className="relative aspect-square md:aspect-[4/3]">
                  <img
                    src={getStylistImage(stylist)}
                    alt={businessName}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    disabled={savingId === stylist.id || !isAuthenticated}
                    title={!isAuthenticated ? "Sign in to save stylists" : savedIds.includes(stylist.id) ? "Remove from saved" : "Save stylist"}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleSave(stylist.id)
                    }}
                  >
                    {savingId === stylist.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    ) : (
                      <Heart
                        className={`w-4 h-4 ${
                          savedIds.includes(stylist.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`}
                      />
                    )}
                  </Button>
                  {stylist.is_verified && (
                    <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700">Verified</Badge>
                  )}
                </div>

                <div className="p-2 md:p-4">
                  {/* Mobile Layout - Title first, then stars below */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2 min-w-0">
                    <h3 className="font-medium text-base text-gray-900 leading-tight truncate">{businessName}</h3>
                    <StarDisplay rating={rating} totalReviews={reviewCount} size="sm" className="flex-shrink-0" />
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
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

      {/* Load More - Only show if we have stylists */}
      {!loading && !error && filteredStylists.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Stylists
          </Button>
        </div>
      )}
    </div>
  )
}
