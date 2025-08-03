"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import Link from "next/link"

const categories = [
  {
    name: "Wigs & Weaves",
    image: "/images/wigs-weave-2.jpg",
    slug: "wigs-weaves",
  },
  {
    name: "Braids",
    image: "/images/braids.jpg",
    slug: "braids",
  },
  {
    name: "Locs",
    image: "/images/locs-new.jpg",
    slug: "locs",
  },
  {
    name: "Natural Hair",
    image: "/images/natural-new.jpg",
    slug: "natural-hair",
  },
  {
    name: "Bridal Hair",
    image: "/images/bridal-new.jpg",
    slug: "bridal-hair",
  },
  {
    name: "Silk Press",
    image: "/images/silk-press-new.jpg",
    slug: "silk-press",
  },
]

export function CategoryCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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
    <section className="bg-white py-8 md:py-14">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Browse by Category</h2>
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
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex-none w-[70%] sm:w-[45%] md:w-[30%] lg:w-[23%]"
                style={{ scrollSnapAlign: "start" }}
              >
                <Link href={`/browse?category=${encodeURIComponent(category.name)}`}>
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                    style={{ aspectRatio: "4/5" }}
                  >
                    <CardContent className="p-0 relative h-full">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="font-bold text-lg text-white text-center">{category.name}</h3>
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
