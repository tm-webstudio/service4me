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

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <BrowseHeader category={category || undefined} location={location || undefined} />
      <StylistGrid />
      <Footer />
    </div>
  )
}
