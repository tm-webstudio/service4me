"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Search, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const router = useRouter()

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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 md:mt-4">
        <div
          className="relative rounded-lg h-[540px] md:h-[540px] min-[1281px]:h-[620px] flex pb-16 flex-col items-center justify-start md:justify-center p-5 md:px-12 bg-gray-700 pt-6 md:pt-0"
        >
          {/* Mobile background image */}
          <img
            src="/hero-mobile.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-lg md:hidden"
          />
          {/* Desktop background image */}
          <img
            src="/hero-desktop.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-lg hidden md:block"
          />

          <div className="w-full relative z-10 flex flex-col items-center text-center md:-translate-y-4">
            <div className="max-w-[90%]">
              <h1
                className="font-medium text-white mb-2 text-[1.75rem] md:mb-3 md:text-5xl tracking-tight md:max-w-[20ch] md:mx-auto"
                style={{ lineHeight: "108%" }}
              >
                Book Your Next Beauty Appointment.
              </h1>
              <p
                className="font-extralight text-white mb-4 md:mb-6 text-base lg:text-lg"
                style={{ lineHeight: "1.3rem" }}
              >
                Discover trusted service providers in your area
              </p>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = query.trim()
                router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse")
              }}
              className="w-full max-w-[98%] md:max-w-[40rem] flex items-center bg-white rounded-md overflow-hidden h-12 md:h-12"
            >
              <span className="pl-4 pr-2 text-gray-400 flex-shrink-0">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search east london braider..."
                className="flex-1 h-full pr-2 text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 transition-colors h-full px-4 flex items-center justify-center flex-shrink-0"
              >
                <ArrowUpRight className="w-5 h-5 text-white" />
              </button>
            </form>
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
                  className="flex-shrink-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 rounded-full text-sm font-normal transition-colors whitespace-nowrap border border-white/20 py-1"
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
