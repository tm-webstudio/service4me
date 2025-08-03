"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Heart } from "lucide-react"
import Link from "next/link"

const stylists = [
  {
    id: 1,
    businessName: "RS Hair",
    image: "/placeholder.svg?height=300&width=300&text=RS+Hair",
    rating: 4.9,
    reviewCount: 127,
    location: "Barking, London",
    distance: "2.3 miles",
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
    distance: "3.1 miles",
    expertise: "Silk Press Specialist",
    featured: false,
  },
  {
    id: 3,
    businessName: "Crowned & Curly",
    image: "/placeholder.svg?height=300&width=300&text=Crowned+%26+Curly",
    rating: 4.9,
    reviewCount: 156,
    location: "Brixton, London",
    distance: "1.8 miles",
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
    distance: "4.2 miles",
    expertise: "Locs Specialist",
    featured: false,
  },
  {
    id: 5,
    businessName: "Color Me Beautiful",
    image: "/placeholder.svg?height=300&width=300&text=Color+Me+Beautiful",
    rating: 4.8,
    reviewCount: 94,
    location: "Hackney, London",
    distance: "2.7 miles",
    expertise: "Hair Color Specialist",
    featured: false,
  },
  {
    id: 6,
    businessName: "Natural Roots",
    image: "/placeholder.svg?height=300&width=300&text=Natural+Roots",
    rating: 4.6,
    reviewCount: 67,
    location: "Lewisham, London",
    distance: "3.5 miles",
    expertise: "Natural Hair Specialist",
    featured: false,
  },
]

export function StylistGrid() {
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Browse Stylists Header with Sort */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Browse Stylists</h2>
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

      {/* Stylist Grid - Same as Homepage Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stylists.map((stylist) => (
          <Link key={stylist.id} href={`/stylist/${stylist.id}`}>
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
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

                <div className="p-2 md:p-4">
                  {/* Mobile Layout - Title first, then stars below */}
                  <div className="md:hidden">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{stylist.businessName}</h3>
                    <div className="flex items-center space-x-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{stylist.rating}</span>
                      <span className="text-sm text-gray-500">({stylist.reviewCount})</span>
                    </div>
                  </div>

                  {/* Desktop Layout - Title and stars side by side */}
                  <div className="hidden md:flex items-center justify-between mb-2">
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
                        {stylist.expertise.length > 18 ? `${stylist.expertise.substring(0, 18)}...` : stylist.expertise}
                      </span>
                      <span className="hidden md:inline">{stylist.expertise}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Load More Stylists
        </Button>
      </div>
    </div>
  )
}
