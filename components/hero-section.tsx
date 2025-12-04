"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useRef } from "react"

export function HeroSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let isPaused = false

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += 1 // Smooth 1px per frame

        // Reset to beginning when reaching the end for seamless loop
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    // Start animation
    animationId = requestAnimationFrame(animate)

    // Pause on hover
    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }

    scrollContainer.addEventListener("mouseenter", handleMouseEnter)
    scrollContainer.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      if (scrollContainer) {
        scrollContainer.removeEventListener("mouseenter", handleMouseEnter)
        scrollContainer.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <section className="py-0">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
        <div
          className="relative rounded-lg h-[540px] md:h-[600px] min-[1281px]:h-[700px] flex pb-16 flex-col items-start justify-start md:justify-center p-5 md:px-12"
          style={{
            backgroundImage: `url('/images/hero-mobile-new.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Desktop background image */}
          <div
            className="absolute inset-0 rounded-lg hidden md:block"
            style={{
              backgroundImage: `url('/images/hero-desktop-new.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div className="w-full relative z-10">
            <div className="max-w-[90%] md:max-w-[25%]">
              <h1
                className="font-bold text-white mb-2 text-[2.125rem] md:mb-3 md:text-5xl tracking-tight"
                style={{ lineHeight: "108%" }}
              >
                Find Your Next Hair Stylist.
              </h1>
              <p className="text-white mb-5 md:mb-6" style={{ lineHeight: "125%", fontSize: "1.1rem" }}>
                <span className="md:text-[1.2rem]" style={{ lineHeight: "1.3" }}>
                  Discover trusted talented hairstylists in your area
                </span>
              </p>
            </div>

            {/* Find a Stylist Button */}
            <Link href="/collections" className="w-full md:w-auto">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white rounded-md w-full md:w-auto px-12 py-3 text-base font-semibold"
              >
                Find a Stylist
              </Button>
            </Link>
          </div>

          {/* Location Tags - Auto-scrolling Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 py-6 z-10">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-3 px-6 pb-2"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              } as React.CSSProperties}
            >
              {[
                "Braids In North London",
                "Silk Press In East London",
                "Wigs In South London",
                "Locs In West London",
                "Natural Hair In Central London",
                "Color & Highlights In Croydon",
                "Cuts & Trims In Barking",
                "Protective Styles In Wembley",
                "Twist Outs In Brixton",
                "Deep Conditioning In Hackney",
                "Bridal Hair In Lewisham",
                "Hair Extensions In Chadwell Heath",
                // Duplicate for seamless loop
                "Braids In North London",
                "Silk Press In East London",
                "Wigs In South London",
                "Locs In West London",
                "Natural Hair In Central London",
                "Color & Highlights In Croydon",
              ].map((location, index) => (
                <Link
                  key={`${location}-${index}`}
                  href={`/browse?location=${encodeURIComponent(location.replace("Braids In ", ""))}`}
                  className="flex-shrink-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap border border-white/20 py-1"
                >
                  {location}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
