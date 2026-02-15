"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { Badge } from "@/components/ui/badge"
import { SpecialistBadge } from "@/components/ui/specialist-badge"
import { MapPin, Heart, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { StarDisplay } from "@/components/ui/star-rating"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useStylists, type StylistProfile } from "@/hooks/use-stylists"
import { useSavedStylistIds } from "@/hooks/use-saved-stylists"
import { postcodeToAreaName, postcodeToAreaNameWithCode } from "@/lib/postcode-utils"
import { StylistCardSkeleton } from "@/components/ui/skeletons"

export function FeaturedStylists() {
  const router = useRouter()
  const { stylists, loading, error } = useStylists()
  const { savedIds, toggleSave, savingId, isAuthenticated } = useSavedStylistIds()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current
      const scrollAmount = clientWidth * 0.8
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount

      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-6 md:py-10 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-medium text-gray-900">
              London Stylists
            </h2>
          </div>
          <SmallCtaButton
            variant="outline"
            onClick={() => router.push("/browse")}
          >
            View All
          </SmallCtaButton>
        </div>

        {/* Loading State with Skeletons */}
        {loading && (
          <div className="flex overflow-x-auto gap-4 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex-none w-[calc(83.33%-8px)] sm:w-[calc(50%-6px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] xl:w-[calc((100%-56px)/4.5)] 2xl:w-[calc((100%-64px)/5)]"
              >
                <StylistCardSkeleton />
              </div>
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
        {!loading && !error && stylists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No stylists available yet.</p>
            <p className="text-sm text-gray-500">Check back soon as new stylists join regularly!</p>
          </div>
        )}

        {/* Carousel with side navigation - Only show if we have stylists */}
        {!loading && !error && stylists.length > 0 && (
          <div className="relative">
            {/* Left Navigation Button */}
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-sm rounded-full hidden md:flex"
                onClick={() => scroll("left")}
                style={{ marginLeft: "-20px" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            {/* Right Navigation Button */}
            <Button
              variant="outline"
              size="icon"
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-sm rounded-full hidden md:flex ${
                !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              style={{ marginRight: "-20px" }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Carousel */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-4 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollSnapType: "x mandatory",
              }}
              onScroll={checkScrollButtons}
            >
              {stylists.map((stylist) => {
                const expertise = getExpertiseDisplay(stylist.specialties)
                const businessName = stylist.business_name || "Hair Studio"
                const location = stylist.location ? postcodeToAreaNameWithCode(stylist.location) : "London, UK"
                const rating = stylist.average_rating || 0
                const reviewCount = stylist.review_count || 0
                
                return (
                  <div
                    key={stylist.id}
                    className="flex-none w-[calc(83.33%-8px)] sm:w-[calc(50%-6px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] xl:w-[calc((100%-56px)/4.5)] 2xl:w-[calc((100%-64px)/5)]"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <Card 
                      className="group cursor-pointer hover:shadow-sm transition-shadow h-full"
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
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1 gap-1 md:gap-2 min-w-0">
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
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
