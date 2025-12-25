"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

interface BrowseHeaderProps {
  category?: string
  location?: string
}

const categoryTitles: Record<string, string> = {
  "Wigs": "Wig Stylists",
  Braids: "Braid Stylists",
  Locs: "Locs Stylists",
  "Natural Hair": "Natural Hair Stylists",
  "Bridal Hair": "Bridal Hair Stylists",
  "Silk Press": "Silk Press Stylists",
}

const categoryDescriptions: Record<string, string> = {
  "Wigs": "Connect with professionals who excel in wig installations and weave applications",
  Braids: "Discover skilled stylists specializing in protective braiding styles and creative patterns",
  Locs: "Find experts in loc maintenance, styling, and professional loc installation services",
  "Natural Hair": "Explore stylists dedicated to natural hair health, styling, and maintenance",
  "Bridal Hair": "Meet specialists in wedding hair styling, updos, and special occasion services",
  "Silk Press": "Find experts in silk press techniques for smooth, sleek, and healthy hair transformations",
}

const locationDescriptions: Record<string, string> = {
  "North London": "Discover talented hairstylists across North London, from Camden to Islington and beyond",
  "East London": "Find skilled stylists in East London's vibrant areas including Shoreditch, Hackney, and Stratford",
  "South London":
    "Connect with professional hairstylists in South London, covering Brixton, Clapham, and surrounding areas",
  "West London": "Explore expert stylists in West London, from Notting Hill to Hammersmith and Kensington",
}

export function BrowseHeader({ category, location }: BrowseHeaderProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  // Determine title and description based on category and location
  let title = "All Stylists"
  let description = "Discover talented hairstylists in your area"

  if (category && location) {
    const categoryTitle = categoryTitles[category] || `${category} Stylists`
    title = `${categoryTitle} in ${location}`
    description = `Find expert ${category.toLowerCase()} stylists in ${location}`
  } else if (category) {
    title = categoryTitles[category] || `${category} Stylists`
    description = categoryDescriptions[category] || "Discover talented hairstylists specializing in this service"
  } else if (location) {
    title = `Stylists in ${location}`
    description = locationDescriptions[location] || `Find talented hairstylists in ${location}`
  }

  return (
    <>
      <PageHeader title={title} description={description} />

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilters([])}
                className="text-red-600 hover:text-red-700"
              >
                Clear all
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
