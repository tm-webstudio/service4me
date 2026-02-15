"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"
import { getServiceTypeLabel } from "@/lib/service-types"

interface BrowseHeaderProps {
  category?: string
  location?: string
  serviceType?: string
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

const serviceTypeTitles: Record<string, string> = {
  hairstylist: "Hairstylists",
  nail_technician: "Nail Technicians",
  lash_technician: "Lash Technicians",
  makeup_artist: "Makeup Artists",
  brow_technician: "Brow Technicians",
  esthetician: "Estheticians",
  massage_therapist: "Massage Therapists",
}

const serviceTypeDescriptions: Record<string, string> = {
  hairstylist: "Discover talented hairstylists specializing in a range of hair services",
  nail_technician: "Find skilled nail technicians for manicures, acrylics, gel nails, and nail art",
  lash_technician: "Connect with lash technicians for extensions, lifts, and lash treatments",
  makeup_artist: "Browse professional makeup artists for bridal, glam, and everyday looks",
  brow_technician: "Find brow specialists for microblading, lamination, and shaping",
  esthetician: "Explore estheticians offering facials, peels, and skin treatments",
  massage_therapist: "Discover massage therapists for deep tissue, sports, and relaxation massage",
}

const locationDescriptions: Record<string, string> = {
  "North London": "Discover talented hairstylists across North London, from Camden to Islington and beyond",
  "East London": "Find skilled stylists in East London's vibrant areas including Shoreditch, Hackney, and Stratford",
  "South London":
    "Connect with professional hairstylists in South London, covering Brixton, Clapham, and surrounding areas",
  "West London": "Explore expert stylists in West London, from Notting Hill to Hammersmith and Kensington",
}

export function BrowseHeader({ category, location, serviceType }: BrowseHeaderProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  // Determine title and description based on serviceType, category, and location
  let title = "All Professionals"
  let description = "Discover talented beauty professionals in your area"

  if (serviceType) {
    title = serviceTypeTitles[serviceType] || `${getServiceTypeLabel(serviceType)}s`
    description = serviceTypeDescriptions[serviceType] || `Discover talented ${getServiceTypeLabel(serviceType).toLowerCase()}s`
    if (location) {
      title = `${title} in ${location}`
      description = `Find expert ${getServiceTypeLabel(serviceType).toLowerCase()}s in ${location}`
    }
  } else if (category && location) {
    const categoryTitle = categoryTitles[category] || `${category} Specialists`
    title = `${categoryTitle} in ${location}`
    description = `Find expert ${category.toLowerCase()} specialists in ${location}`
  } else if (category) {
    title = categoryTitles[category] || `${category} Specialists`
    description = categoryDescriptions[category] || "Discover talented professionals specializing in this service"
  } else if (location) {
    title = `Professionals in ${location}`
    description = locationDescriptions[location] || `Find talented beauty professionals in ${location}`
  }

  return (
    <>
      <PageHeader title={title} description={description} />

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
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
