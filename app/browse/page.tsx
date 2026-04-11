"use client"

import { Navigation } from "@/components/navigation"
import { BrowseHeader } from "@/components/browse-header"
import { StylistGrid } from "@/components/stylist-grid"
import { Footer } from "@/components/footer"
import { useSearchParams } from "next/navigation"

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category")
  const location = searchParams.get("location")
  const serviceType = searchParams.get("serviceType")
  const query = searchParams.get("q")

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <BrowseHeader
        category={category || undefined}
        location={location || undefined}
        serviceType={serviceType || undefined}
        query={query || undefined}
      />
      <StylistGrid
        category={category || undefined}
        location={location || undefined}
        serviceType={serviceType || undefined}
        query={query || undefined}
      />
      <Footer />
    </div>
  )
}
