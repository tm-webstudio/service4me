"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-v2"
import { AuthStatus } from "@/lib/auth-v2/types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Menu, User, ChevronDown, X, LayoutDashboard, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const safariStyles = `
  @supports (-webkit-touch-callout: none) {
    .sheet-content-safari {
      height: -webkit-fill-available !important;
    }
  }
  
  /* Hide scrollbars for mobile menu */
  .mobile-menu-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .mobile-menu-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

export function Navigation() {
  const { status, user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const [browseStylistsOpen, setBrowseStylistsOpen] = useState(false)
  const [londonOpen, setLondonOpen] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showBrowseMega, setShowBrowseMega] = useState(false)
  const [showLocationsMega, setShowLocationsMega] = useState(false)

  const browseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const locationsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const messages = [
    "Onboarding London Stylists. Apply Now",
    "Book Your Next Hair Appointment Today",
    "New Stylists Added Weekly",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
    }, 4000) // Change message every 4 seconds

    return () => clearInterval(interval)
  }, [messages.length])

  const nextMessage = () => {
    setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
  }

  const prevMessage = () => {
    setCurrentMessageIndex((prev) => (prev - 1 + messages.length) % messages.length)
  }

  const handleBrowseMouseEnter = () => {
    if (browseTimeoutRef.current) {
      clearTimeout(browseTimeoutRef.current)
    }
    setShowBrowseMega(true)
  }

  const handleBrowseMouseLeave = () => {
    browseTimeoutRef.current = setTimeout(() => {
      setShowBrowseMega(false)
    }, 150) // Small delay to prevent flickering
  }

  const handleLocationsMouseEnter = () => {
    if (locationsTimeoutRef.current) {
      clearTimeout(locationsTimeoutRef.current)
    }
    setShowLocationsMega(true)
  }

  const handleLocationsMouseLeave = () => {
    locationsTimeoutRef.current = setTimeout(() => {
      setShowLocationsMega(false)
    }, 150) // Small delay to prevent flickering
  }

  const categories = [
    { name: "Wigs", image: "/images/wigs-weave.jpg", description: "Premium wigs and weave installations" },
    { name: "Braids", image: "/images/braids.jpg", description: "Traditional and modern braiding styles" },
    { name: "Locs", image: "/images/locs.jpg", description: "Professional loc maintenance and styling" },
    { name: "Natural Hair", image: "/images/natural.jpg", description: "Natural hair care and styling" },
    { name: "Bridal Hair", image: "/images/bridal.jpg", description: "Elegant bridal hair styling" },
    { name: "Silk Press", image: "/images/silk-press.jpg", description: "Smooth silk press treatments" },
  ]

  const londonAreas = ["North London", "East London", "South London", "West London"]

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
      setIsOpen(false)
    } catch (error) {
      // Still redirect and close menu even if there's an error
      router.push("/")
      setIsOpen(false)
    }
  }

  const handleDashboard = () => {
    // Single source of truth: user.role from auth-v2
    if (!user) return

    if (user.role === 'admin') {
      router.push('/admin')
    } else if (user.role === 'stylist') {
      router.push('/dashboard/stylist')
    } else {
      router.push('/dashboard/client')
    }
    setIsOpen(false)
  }

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = safariStyles
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = "0"
    } else {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-red-600 text-white text-center sm:px-6 lg:px-8 py-1.5 md:py-1 relative">
        <div className="max-w-screen-2xl mx-auto relative sm:px-6 lg:px-8">
          <button
            onClick={prevMessage}
            className="absolute left-2 sm:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Previous message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <p className="font-medium text-[0.9rem] md:text-base transition-opacity duration-300">
            {messages[currentMessageIndex]}
          </p>

          <button
            onClick={nextMessage}
            className="absolute right-2 sm:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Next message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto,1fr] md:grid-cols-[auto,1fr,auto] lg:grid-cols-[1fr,auto,1fr] items-center h-16 gap-6 md:gap-8 lg:gap-10">
            {/* Logo */}
            <div className="flex justify-start">
              <Link href="/" className="flex items-center">
                <span className="font-bold text-gray-900 tracking-tight text-xl" style={{ fontSize: "26px" }}>
                  S<span className="text-red-600">4</span>M
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center md:justify-start lg:justify-center space-x-8 md:col-start-2">
              {/* Browse Stylists Mega Menu */}
              <div className="relative" onMouseEnter={handleBrowseMouseEnter} onMouseLeave={handleBrowseMouseLeave}>
                <button className="flex items-center text-gray-700 hover:text-red-600 font-medium transition-colors py-4">
                  Browse Stylists
                  <ChevronDown className="w-4 h-4 ml-1 text-red-600" />
                </button>

                {showBrowseMega && (
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 pt-1 w-[800px] z-50"
                    onMouseEnter={handleBrowseMouseEnter}
                    onMouseLeave={handleBrowseMouseLeave}
                  >
                    <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm">
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Hair Styling Categories</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {categories.map((category) => (
                            <Link
                              key={category.name}
                              href={`/browse?category=${encodeURIComponent(category.name)}`}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={category.image || "/placeholder.svg"}
                                  alt={category.name}
                                  width={64}
                                  height={80}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <Link
                            href="/browse"
                            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            View All Stylists
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Locations Mega Menu */}
              <div
                className="relative"
                onMouseEnter={handleLocationsMouseEnter}
                onMouseLeave={handleLocationsMouseLeave}
              >
                <button className="flex items-center text-gray-700 hover:text-red-600 font-medium transition-colors py-4">
                  Locations
                  <ChevronDown className="w-4 h-4 ml-1 text-red-600" />
                </button>

                {showLocationsMega && (
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 pt-1 w-[300px] z-50"
                    onMouseEnter={handleLocationsMouseEnter}
                    onMouseLeave={handleLocationsMouseLeave}
                  >
                    <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm">
                      <div className="p-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-4">London Areas</h3>
                          <div className="space-y-2">
                            {londonAreas.map((area) => (
                              <Link
                                key={area}
                                href={`/browse?location=${encodeURIComponent(area)}`}
                                className="block text-gray-700 hover:text-red-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                              >
                                {area}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center justify-end space-x-4 md:col-start-3 lg:col-start-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      {user.fullName && (
                        <span className="text-sm max-w-[100px] truncate">
                          {user.fullName.split(' ')[0]}
                        </span>
                      )}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 text-sm">
                      <div className="font-medium">{user.fullName || user.email}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-blue-600 capitalize">{user.role}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDashboard} className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login-v2">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              {(!user || user.role !== 'stylist') && (
                <Link href="/list-business">
                  <Button size="sm" className="bg-gray-200 text-neutral-600 hover:bg-gray-300 text-[0.825rem]">
                    List Your Business
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center justify-end space-x-3 col-start-2">
              {(!user || user.role !== 'stylist') && (
                <Link href="/list-business">
                  <Button size="sm" className="bg-gray-200 text-neutral-600 hover:bg-gray-300 text-[0.825rem] px-3">
                    List Your Business
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 bg-transparent"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Custom Mobile Menu Overlay - iPhone Optimized */}
              {isOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/50 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* Menu Panel */}
                  <div
                    className={`fixed top-0 right-0 bottom-0 w-[300px] sm:w-[400px] bg-white shadow-lg transform transition-transform duration-300 ease-out ${
                      isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                    style={{
                      height: "100svh",
                      maxHeight: "100svh",
                      display: "flex",
                      flexDirection: "column",
                      position: "fixed",
                    } as React.CSSProperties}
                  >
                    {/* Header - Fixed at top */}
                    <div className="flex items-center justify-between pl-6 pr-4 py-4 border-b bg-white flex-shrink-0">
                      <span className="font-bold text-gray-900 tracking-tight text-xl">
                        S<span className="text-red-600">4</span>M
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="p-2">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div
                      className="flex-1 overflow-y-auto p-6 space-y-4 mobile-menu-scroll"
                      style={{
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      {/* User Profile Section (Mobile) */}
                      {user && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.fullName || user.email}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-sm text-blue-600 capitalize">{user.role}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Browse Stylists Collapsible */}
                      <Collapsible open={browseStylistsOpen} onOpenChange={setBrowseStylistsOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full font-medium text-gray-900 hover:text-red-600 transition-colors py-2 text-base">
                          Browse Stylists
                          <ChevronDown
                            className={`w-4 h-4 text-red-600 transition-transform duration-200 ${
                              browseStylistsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1">
                          <div className="pl-1 space-y-3">
                            {categories.map((category) => (
                              <Link
                                key={category.name}
                                href={`/browse?category=${encodeURIComponent(category.name)}`}
                                className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                <div className="w-10 h-12 rounded-md overflow-hidden flex-shrink-0">
                                  <Image
                                    src={category.image || "/placeholder.svg"}
                                    alt={category.name}
                                    width={40}
                                    height={50}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{category.name}</div>
                                  <div className="text-xs text-gray-500">{category.description}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Locations Collapsible */}
                      <Collapsible open={londonOpen} onOpenChange={setLondonOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full font-medium text-gray-900 hover:text-red-600 transition-colors py-2 text-base">
                          Locations
                          <ChevronDown
                            className={`w-4 h-4 text-red-600 transition-transform duration-200 ${
                              londonOpen ? "rotate-180" : ""
                            }`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="pl-2 pt-2 space-y-3">
                            {londonAreas.map((area) => (
                              <Link
                                key={area}
                                href={`/browse?location=${encodeURIComponent(area)}`}
                                className="block text-gray-700 hover:text-red-600 transition-colors py-1"
                                onClick={() => setIsOpen(false)}
                              >
                                {area}
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Additional spacing at bottom for better scrolling */}
                      <div className="h-4"></div>
                    </div>

                    {/* Bottom CTA Section - Fixed at bottom */}
                    <div className="border-t p-6 bg-white flex-shrink-0">
                      {user ? (
                        <>
                          <Button
                            variant="outline"
                            className="w-full justify-center bg-transparent text-[0.85rem] mb-3"
                            onClick={handleDashboard}
                          >
                            <LayoutDashboard className="w-4 h-4 mr-1" />
                            Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-center bg-transparent text-[0.85rem] mb-4"
                            onClick={handleSignOut}
                          >
                            <LogOut className="w-4 h-4 mr-1" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Link href="/login-v2">
                          <Button
                            variant="outline"
                            className="w-full justify-center bg-transparent mb-3 text-[0.85rem]"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Sign In
                          </Button>
                        </Link>
                      )}
                      {(!user || user.role !== 'stylist') && (
                        <Link href="/list-business">
                          <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-[0.825rem]"
                            onClick={() => setIsOpen(false)}
                          >
                            List Your Business
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
