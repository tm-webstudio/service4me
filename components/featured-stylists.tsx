"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"
import Link from "next/link"

const featuredStylists = [
  {
    id: 1,
    businessName: "RS Hair",
    image: "/placeholder.svg?height=300&width=300&text=RS+Hair",
    rating: 4.9,
    reviewCount: 127,
    location: "Barking, London",
    expertise: "Braids Specialist",
    featured: true,
  },
  {
    id: 2,
    businessName: "HairByVee",
    image: "/placeholder.svg?height=300&width=300&text=HairByVee",
    rating: 4.8,
    reviewCount: 89,
    location: "Wembley, London",
    expertise: "Silk Press Specialist",
    featured: true,
  },
  {
    id: 3,
    businessName: "Crowned & Curly",
    image: "/placeholder.svg?height=300&width=300&text=Crowned+%26+Curly",
    rating: 4.9,
    reviewCount: 156,
    location: "Brixton, London",
    expertise: "Wigs & Weaves Specialist",
    featured: true,
  },
  {
    id: 4,
    businessName: "Braids & Beyond",
    image: "/placeholder.svg?height=300&width=300&text=Braids+%26+Beyond",
    rating: 4.7,
    reviewCount: 73,
    location: "Croydon, London",
    expertise: "Locs Specialist",
    featured: true,
  },
  {
    id: 5,
    businessName: "Color Me Beautiful",
    image: "/placeholder.svg?height=300&width=300&text=Color+Me+Beautiful",
    rating: 4.8,
    reviewCount: 94,
    location: "Hackney, London",
    expertise: "Hair Color Specialist",
    featured: true,
  },
  {
    id: 6,
    businessName: "Natural Roots",
    image: "/placeholder.svg?height=300&width=300&text=Natural+Roots",
    rating: 4.6,
    reviewCount: 67,
    location: "Lewisham, London",
    expertise: "Natural Hair Specialist",
    featured: true,
  },
]

export function FeaturedStylists() {
  const [favorites, setFavorites] = useState<number[]>([])
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
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
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">London Stylists</h2>
          </div>
          <Link href="/browse">
            <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent">
              View All
            </Button>
          </Link>
        </div>

        {/* Carousel with side navigation */}
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
            {featuredStylists.map((stylist) => (
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
                          src={stylist.image || "/placeholder.svg"}
                          alt={stylist.businessName}
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
                        {stylist.featured && (
                          <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700">Featured</Badge>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{stylist.businessName}</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{stylist.rating}</span>
                            <span className="text-sm text-gray-500">({stylist.reviewCount})</span>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{stylist.location}</span>
                        </div>

                        <div className="mb-3">
                          <span className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                            <span className="md:hidden">
                              {stylist.expertise.length > 18
                                ? `${stylist.expertise.substring(0, 18)}...`
                                : stylist.expertise}
                            </span>
                            <span className="hidden md:inline">{stylist.expertise}</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
