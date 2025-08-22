"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Heart, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import Link from "next/link"
import { useStylists, type StylistProfile } from "@/hooks/use-stylists"
import { postcodeToAreaName } from "@/lib/postcode-utils"
import { StylistCardSkeleton } from "@/components/ui/skeletons"

export function FeaturedStylists() {
  const { stylists, loading, error } = useStylists()
  const [favorites, setFavorites] = useState<string[]>([])
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

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
    <section className="py-10 md:py-16 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              London Stylists
            </h2>
          </div>
          <Link href="/browse">
            <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent">
              View All
            </Button>
          </Link>
        </div>

        {/* Loading State with Skeletons */}
        {loading && (
          <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex-none w-[calc(83.33%-8px)] sm:w-[calc(50%-6px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)]"
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
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full hidden md:flex"
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
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full hidden md:flex ${
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
              className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
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
                const location = stylist.location ? postcodeToAreaName(stylist.location) : "London, UK"
                const rating = stylist.rating || 0
                const reviewCount = stylist.total_reviews || 0
                
                return (
                  <div
                    key={stylist.id}
                    className="flex-none w-[calc(83.33%-8px)] sm:w-[calc(50%-6px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)]"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <Link href={`/stylist/${stylist.id}`}>
                      <Card className="group cursor-pointer hover:shadow-lg transition-shadow h-full">
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
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleFavorite(stylist.id)
                              }}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  favorites.includes(stylist.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                                }`}
                              />
                            </Button>
                            {stylist.is_verified && (
                              <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700">Verified</Badge>
                            )}
                          </div>

                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">{businessName}</h3>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : "New"}</span>
                                <span className="text-sm text-gray-500">({reviewCount})</span>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600 mb-3">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{location}</span>
                            </div>

                            <div className="mb-3">
                              <span className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                <span className="md:hidden">
                                  {expertise.length > 18 ? `${expertise.substring(0, 18)}...` : expertise}
                                </span>
                                <span className="hidden md:inline">{expertise}</span>
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
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